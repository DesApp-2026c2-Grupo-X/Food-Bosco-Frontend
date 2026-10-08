import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CheckoutPage } from '../index'
import { useAddressStore } from '../../../stores/addressStore'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderWithProviders } from '@test/utils'

const { notifyError } = vi.hoisted(() => ({ notifyError: vi.fn() }))

vi.mock('@repo/components', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/components')>()),
  notifyError,
}))

const rawAddress = {
  id: 'a1',
  label: 'Casa',
  text: 'Av. Siempreviva 742',
  city: 'CABA',
  postalCode: '1425',
  latitude: -34.6,
  longitude: -58.4,
  active: true,
}

const rawCart = {
  id: 'cart',
  clientId: 'c1',
  status: 'OPEN',
  total: 2300,
  items: [
    {
      id: 'i1',
      productId: 'p1',
      product: { id: 'p1', name: 'Burger', price: 1000, configGroups: [], recipe: [] },
      quantity: 2,
      observations: null,
      optionIds: [],
      options: [{ id: 'o1', name: 'Queso', extraPrice: 150, available: true }],
    },
  ],
}

const rawOrder = {
  id: 'o1',
  number: '101',
  clientId: 'c1',
  branchId: 'b1',
  branch: { id: 'b1', name: 'Centro' },
  deliveryAddress: { text: 'Av. Siempreviva 742', latitude: -34.6, longitude: -58.4 },
  status: 'PENDING',
  total: 2300,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T10:00:00Z',
  items: [],
  statusHistory: [],
  availableTransitions: [],
}

const deferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

const setup = (options: { cart?: unknown; createError?: Error; createLoading?: boolean } = {}) => {
  const pendingOrder = deferred<{ data: { createOrder: typeof rawOrder } }>()
  const client = createTestClient((operation) => {
    switch (operation.operationName) {
      case 'MyCart':
        return { data: { myCart: options.cart === undefined ? rawCart : options.cart } }
      case 'MyAddresses':
        return { data: { myAddresses: [rawAddress] } }
      case 'CreateOrder':
        if (options.createError) return options.createError
        if (options.createLoading) return pendingOrder.promise
        return { data: { createOrder: rawOrder } }
      default:
        return { data: {} }
    }
  })
  return {
    client,
    pendingOrder,
    ...renderWithProviders(<CheckoutPage />, { client: client.client }),
  }
}

describe('CheckoutPage flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAddressStore.setState({ selectedAddressId: null })
  })

  it('keeps confirmation disabled until an address is selected', async () => {
    setup()

    const button = await screen.findByRole('button', { name: 'Confirmar pedido' })
    expect(button).toBeDisabled()

    act(() => useAddressStore.setState({ selectedAddressId: 'a1' }))

    await waitFor(() => expect(button).toBeEnabled())
  })

  it('confirms the order with the real cart and selected address', async () => {
    useAddressStore.setState({ selectedAddressId: 'a1' })
    const { client } = setup()

    expect(await screen.findByText('2 × Burger')).toBeInTheDocument()

    const button = await screen.findByRole('button', { name: 'Confirmar pedido' })
    await waitFor(() => expect(button).toBeEnabled())
    await userEvent.click(button)

    expect(await screen.findByText('¡Pedido confirmado!')).toBeInTheDocument()
    expect(screen.getByText('Pedido #101')).toBeInTheDocument()
    expect(operationVariables(client.lastRequest('CreateOrder'))).toEqual({ addressId: 'a1' })
  })

  it('disables the button while the order is being created', async () => {
    useAddressStore.setState({ selectedAddressId: 'a1' })
    const { pendingOrder } = setup({ createLoading: true })

    const button = await screen.findByRole('button', { name: 'Confirmar pedido' })
    await waitFor(() => expect(button).toBeEnabled())
    await userEvent.click(button)

    await waitFor(() => expect(button).toBeDisabled())
    expect(screen.queryByText('¡Pedido confirmado!')).not.toBeInTheDocument()

    pendingOrder.resolve({ data: { createOrder: rawOrder } })

    expect(await screen.findByText('¡Pedido confirmado!')).toBeInTheDocument()
  })

  it('surfaces the error and stays on the page when creation fails', async () => {
    useAddressStore.setState({ selectedAddressId: 'a1' })
    setup({ createError: new Error('boom') })

    const button = await screen.findByRole('button', { name: 'Confirmar pedido' })
    await waitFor(() => expect(button).toBeEnabled())
    await userEvent.click(button)

    expect(
      await screen.findByText('No pudimos confirmar tu pedido. Intentá de nuevo.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('¡Pedido confirmado!')).not.toBeInTheDocument()
    expect(notifyError).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Error al confirmar' }),
    )
  })
})
