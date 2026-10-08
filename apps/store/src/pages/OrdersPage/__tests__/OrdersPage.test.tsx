import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { formatPrice } from '@repo/domain'
import { OrdersPage } from '../index'
import { createTestClient } from '@test/apollo'
import { renderWithProviders } from '@test/utils'

const rawItem = (quantity: number) => ({
  productId: 'p1',
  name: 'Burger',
  unitPrice: 1000,
  quantity,
  observations: null,
  subtotal: 1000 * quantity,
  options: [],
})

const rawOrder = (overrides: Record<string, unknown> = {}) => ({
  id: 'o1',
  number: '101',
  clientId: 'c1',
  branchId: 'b1',
  branch: null,
  deliveryAddress: { text: 'Calle 1', latitude: -34.6, longitude: -58.4 },
  status: 'DELIVERED',
  total: 2300,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T10:00:00Z',
  items: [rawItem(2), rawItem(1)],
  statusHistory: [],
  availableTransitions: [],
  ...overrides,
})

const renderOrders = (myOrders: unknown[]) => {
  const client = createTestClient((operation) => {
    if (operation.operationName === 'MyOrders') {
      return { data: { myOrders } }
    }
    return { data: {} }
  })
  return renderWithProviders(<OrdersPage />, { client: client.client })
}

const renderLoading = () => {
  const client = createTestClient((operation) => {
    if (operation.operationName === 'MyOrders') {
      return new Promise<never>(() => {})
    }
    return { data: {} }
  })
  return renderWithProviders(<OrdersPage />, { client: client.client })
}

describe('OrdersPage', () => {
  it('shows a past order with its item count, branch fallback, price and link', async () => {
    renderOrders([rawOrder()])

    expect(await screen.findByText('Pedido #101')).toBeInTheDocument()
    expect(screen.getByText(/3 ítems · Sucursal/)).toBeInTheDocument()
    expect(screen.getByText(formatPrice(2300).replace(/\s/g, ' '))).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Pedido #101/ })).toHaveAttribute('href', '/orders/o1')
  })

  it('shows the real branch name when present', async () => {
    renderOrders([
      rawOrder({ branch: { id: 'b1', name: 'Centro', addressText: 'Av. 1', hours: [] } }),
    ])

    expect(await screen.findByText(/3 ítems · Centro/)).toBeInTheDocument()
  })

  it('renders active orders with the tracking card', async () => {
    renderOrders([rawOrder({ id: 'o2', number: '202', status: 'ON_THE_WAY' })])

    expect(await screen.findByText('Pedido #202')).toBeInTheDocument()
    expect(screen.getAllByText('En camino').length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Ver seguimiento' })).toHaveAttribute(
      'href',
      '/orders/o2',
    )
  })

  it('does not show the empty state while loading', () => {
    renderLoading()

    expect(screen.getByText('Mis pedidos')).toBeInTheDocument()
    expect(screen.queryByText('Todavía no tenés pedidos')).not.toBeInTheDocument()
  })

  it('shows the empty state when there are no orders', async () => {
    renderOrders([])

    expect(await screen.findByText('Todavía no tenés pedidos')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('Mis pedidos')).toBeInTheDocument())
  })
})
