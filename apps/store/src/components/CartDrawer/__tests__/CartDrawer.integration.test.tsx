import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CartDrawer } from '../index'
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
  optionIds: [],
  options: [],
})

const rawCart = (items: ReturnType<typeof rawItem>[]) => ({
  id: 'cart',
  clientId: 'c1',
  status: 'OPEN',
  total: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  items,
})

const deferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

const setup = (options: { items?: ReturnType<typeof rawItem>[]; cartLoading?: boolean } = {}) => {
  let items = options.items ?? [rawItem(2)]
  const pendingCart = deferred<{ data: { myCart: ReturnType<typeof rawCart> } }>()

  const client = createTestClient((operation) => {
    switch (operation.operationName) {
      case 'MyCart':
        if (options.cartLoading) return pendingCart.promise
        return { data: { myCart: rawCart(items) } }
      case 'UpdateCartItem': {
        const variables = operationVariables(operation) as {
          itemId: string
          input: { quantity: number }
        }
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

  const rendered = renderWithProviders(<CartDrawer open onClose={vi.fn()} />, {
    client: client.client,
  })
  return { client, pendingCart, ...rendered }
}

describe('CartDrawer integration', () => {
  it('renders the lines from the real query and links to the cart', async () => {
    setup()

    expect(await screen.findByText('Burger')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getAllByText(/2\.000/).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Ver carrito y confirmar' })).toHaveAttribute(
      'href',
      '/cart',
    )
  })

  it('updates a line through UpdateCartItem and refetches MyCart', async () => {
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
  })

  it('empties the cart after removal and switches the footer link to the catalog', async () => {
    const { client } = setup()
    await screen.findByText('Burger')
    const before = client.requestsByName('MyCart').length

    await userEvent.click(screen.getByRole('button', { name: /Eliminar/ }))

    await waitFor(() =>
      expect(operationVariables(client.lastRequest('RemoveCartItem'))).toEqual({ itemId: 'i1' }),
    )
    await waitFor(() => expect(client.requestsByName('MyCart').length).toBeGreaterThan(before))

    expect(await screen.findByText('Tu carrito está vacío')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: 'Explorar productos' })
    expect(link).toHaveAttribute('href', '/catalog')
  })

  it('shows the loading state before the cart arrives', async () => {
    const { pendingCart } = setup({ cartLoading: true })

    expect(screen.queryByText('Burger')).not.toBeInTheDocument()
    expect(screen.queryByText('Tu carrito está vacío')).not.toBeInTheDocument()

    pendingCart.resolve({
      data: { myCart: rawCart([rawItem(2)]) },
    })

    expect(await screen.findByText('Burger')).toBeInTheDocument()
  })

  it('shows the empty state when the cart has no lines', async () => {
    setup({ items: [] })

    expect(await screen.findByText('Tu carrito está vacío')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explorar productos' })).toHaveAttribute(
      'href',
      '/catalog',
    )
  })
})
