import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CartPage } from '../index'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderWithProviders } from '@test/utils'

const rawProduct = {
  id: 'p1',
  categoryId: 'c1',
  name: 'Burger',
  description: 'Rica',
  price: 1000,
  image: null,
  available: true,
  configGroups: [],
  recipe: [],
}

const rawItem = (quantity: number) => ({
  id: 'i1',
  productId: 'p1',
  product: rawProduct,
  quantity,
  observations: null,
  optionIds: ['o1'],
  options: [{ id: 'o1', name: 'Queso', extraPrice: 150, available: true }],
})

const rawCart = (items: ReturnType<typeof rawItem>[]) => ({
  id: 'cart',
  clientId: 'c1',
  status: 'OPEN',
  total: items.reduce(
    (sum, item) =>
      sum +
      (item.product.price + item.options.reduce((extra, option) => extra + option.extraPrice, 0)) *
        item.quantity,
    0,
  ),
  items,
})

const deferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

const setup = (options: { items?: ReturnType<typeof rawItem>[]; pendingUpdate?: boolean } = {}) => {
  let items = options.items ?? [rawItem(2)]
  const pending = deferred<{ data: Record<string, never> }>()

  const client = createTestClient((operation) => {
    switch (operation.operationName) {
      case 'MyCart':
        return { data: { myCart: rawCart(items) } }
      case 'UpdateCartItem': {
        const variables = operationVariables(operation) as {
          itemId: string
          input: { quantity: number }
        }
        if (options.pendingUpdate) return pending.promise
        items = items.map((item) =>
          item.id === variables.itemId ? { ...item, quantity: variables.input.quantity } : item,
        )
        return { data: {} }
      }
      case 'RemoveCartItem': {
        const variables = operationVariables(operation) as { itemId: string }
        items = items.filter((item) => item.id !== variables.itemId)
        return { data: {} }
      }
      default:
        return { data: {} }
    }
  })

  return { client, ...renderWithProviders(<CartPage />, { client: client.client }) }
}

describe('CartPage integration', () => {
  it('shows the empty state when the cart has no items', async () => {
    setup({ items: [] })

    expect(await screen.findByText('Tu carrito está vacío')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explorar productos' })).toHaveAttribute(
      'href',
      '/catalog',
    )
  })

  it('renders line totals and the cart total from the real query', async () => {
    setup()

    expect(await screen.findByText('Burger')).toBeInTheDocument()
    expect(screen.getByText(/1\.150 c\/u/)).toBeInTheDocument()
    expect(screen.getAllByText(/2\.300/).length).toBeGreaterThan(0)
  })

  it('updates the quantity through UpdateCartItem and refetches MyCart', async () => {
    const { client } = setup()
    await screen.findByText('Burger')
    const before = client.requestsByName('MyCart').length

    await userEvent.click(screen.getByRole('button', { name: 'Agregar uno' }))

    await waitFor(() =>
      expect(operationVariables(client.lastRequest('UpdateCartItem'))).toEqual({
        itemId: 'i1',
        input: { quantity: 3 },
      }),
    )
    await waitFor(() => expect(client.requestsByName('MyCart').length).toBeGreaterThan(before))
    expect(await screen.findByText('3')).toBeInTheDocument()
  })

  it('removes a line through RemoveCartItem and refetches MyCart', async () => {
    const { client } = setup()
    await screen.findByText('Burger')
    const before = client.requestsByName('MyCart').length

    await userEvent.click(screen.getByRole('button', { name: /Eliminar/ }))

    await waitFor(() =>
      expect(operationVariables(client.lastRequest('RemoveCartItem'))).toEqual({ itemId: 'i1' }),
    )
    await waitFor(() => expect(client.requestsByName('MyCart').length).toBeGreaterThan(before))
    expect(await screen.findByText('Tu carrito está vacío')).toBeInTheDocument()
  })

  it('disables the line controls while a mutation is in flight', async () => {
    const { client } = setup({ pendingUpdate: true })
    await screen.findByText('Burger')

    await userEvent.click(screen.getByRole('button', { name: 'Agregar uno' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Agregar uno' })).toBeDisabled())
    expect(screen.getByRole('button', { name: /Eliminar/ })).toBeDisabled()
    expect(client.lastRequest('UpdateCartItem')).toBeDefined()
  })
})
