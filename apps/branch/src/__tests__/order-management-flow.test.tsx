import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const user = userEvent.setup({ pointerEventsCheck: 0 })
import { Link, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { OrderDetailView } from '@repo/components'
import { useAuthStore } from '@repo/api'
import type { OrderStatus, User } from '@repo/domain'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderWithProviders } from '@test/utils'
import { HomePage } from '../pages/HomePage'
import { OrdersPage } from '../pages/OrdersPage'

const branchAdmin: User = {
  id: 'branch-admin-1',
  email: 'julian.sosa@foodbosco.com',
  role: 'branch_admin',
  firstName: 'Julián',
  lastName: 'Sosa',
  phone: '+54 11 5555 1234',
  active: true,
  createdAt: '2025-01-15T09:00:00',
  branchId: 'b1',
}

const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY_FOR_DELIVERY', 'CANCELLED'],
  READY_FOR_DELIVERY: ['ON_THE_WAY', 'CANCELLED'],
  ON_THE_WAY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

const makeRawOrder = (overrides: Record<string, unknown> = {}) => ({
  id: 'o1',
  number: '101',
  clientId: 'c1',
  branchId: 'b1',
  branch: {
    id: 'b1',
    name: 'Sucursal Centro',
    addressText: 'Av. Siempreviva 742',
    latitude: -34.6,
    longitude: -58.4,
    phone: null,
    active: true,
    hours: [],
  },
  client: {
    id: 'c1',
    email: 'ana@b.com',
    firstName: 'Ana',
    lastName: 'Perez',
    phone: '123',
    role: 'customer',
    active: true,
    branchId: null,
  },
  deliveryAddress: { text: 'Av. Siempreviva 742', latitude: -34.61, longitude: -58.4 },
  status: 'PENDING' as OrderStatus,
  total: 2500,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T10:00:00Z',
  items: [],
  statusHistory: [],
  availableTransitions: ['CONFIRMED', 'CANCELLED'] as OrderStatus[],
  ...overrides,
})

const applyTransition = (
  order: Record<string, unknown>,
  status: OrderStatus,
): Record<string, unknown> => ({
  ...order,
  status,
  availableTransitions: NEXT_STATUS[status],
  statusHistory: [
    ...((order.statusHistory as Record<string, unknown>[]) ?? []),
    { previousStatus: order.status, newStatus: status, changedAt: '2025-01-01T11:00:00Z' },
  ],
})

const makeClient = (initial: Record<string, unknown>[]) => {
  let orders = initial

  return createTestClient((operation) => {
    switch (operation.operationName) {
      case 'AdminOrders':
        return { data: { orders } }
      case 'AdminOrder': {
        const { id } = operationVariables(operation) as { id: string }
        return { data: { order: orders.find((order) => order.id === id) ?? null } }
      }
      case 'ChangeOrderStatus': {
        const { orderId, status } = operationVariables(operation) as {
          orderId: string
          status: OrderStatus
        }
        orders = orders.map((order) =>
          order.id === orderId ? applyTransition(order, status) : order,
        )
        return { data: { changeOrderStatus: orders.find((order) => order.id === orderId) } }
      }
      default:
        return { data: {} }
    }
  })
}

const BranchRoutes = () => (
  <>
    <Link to="/orders">Ir a pedidos</Link>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/orders/:orderId" element={<OrderDetailView />} />
    </Routes>
  </>
)

const renderFlow = (orders: Record<string, unknown>[], route = '/') => {
  const client = makeClient(orders)
  renderWithProviders(<BranchRoutes />, { route, client: client.client })
  return client
}

describe('branch order management flow', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: branchAdmin,
      accessToken: 'access',
      refreshToken: 'refresh',
      bypassAuth: false,
    })
  })

  it('moves an order through a transition and reflects it in the list', async () => {
    const client = renderFlow([makeRawOrder()])

    expect(await screen.findByText('Pedidos que requieren atención')).toBeInTheDocument()
    expect(screen.getByText('#101 · Ana Perez')).toBeInTheDocument()
    expect(screen.getByText('Pendiente')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /Operar estados/ }))
    expect(
      await screen.findByText('Consultá y operá los pedidos de tu sucursal.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Ver' }))
    expect(await screen.findByText('Pedido #101')).toBeInTheDocument()

    await user.selectOptions(screen.getByRole('combobox'), 'CONFIRMED')
    await user.click(screen.getByRole('button', { name: 'Cambiar estado' }))
    await user.click(await screen.findByRole('button', { name: 'Confirmar' }))

    await waitFor(() =>
      expect(operationVariables(client.lastRequest('ChangeOrderStatus'))).toEqual({
        orderId: 'o1',
        status: 'CONFIRMED',
      }),
    )

    const before = client.requestsByName('AdminOrders').length

    await user.click(screen.getByRole('link', { name: 'Ir a pedidos' }))

    await waitFor(() => expect(client.requestsByName('AdminOrders').length).toBeGreaterThan(before))
    await waitFor(() => {
      const table = screen.getByRole('table')
      expect(within(table).getByText('Confirmado')).toBeInTheDocument()
      expect(within(table).queryByText('Pendiente')).not.toBeInTheDocument()
    })
  })

  it('does not mutate the order when the confirmation is cancelled', async () => {
    const client = renderFlow([makeRawOrder()], '/orders/o1')

    expect(await screen.findByText('Pedido #101')).toBeInTheDocument()

    await user.selectOptions(screen.getByRole('combobox'), 'CONFIRMED')
    await user.click(screen.getByRole('button', { name: 'Cambiar estado' }))
    await user.click(await screen.findByRole('button', { name: 'Cancelar' }))

    await waitFor(() =>
      expect(screen.queryByText('Confirmar cambio de estado')).not.toBeInTheDocument(),
    )
    expect(client.requestsByName('ChangeOrderStatus')).toHaveLength(0)
  })

  it('shows the empty transitions message when the order has none available', async () => {
    renderFlow([makeRawOrder({ availableTransitions: [] })], '/orders/o1')

    expect(
      await screen.findByText('No hay transiciones disponibles para este pedido.'),
    ).toBeInTheDocument()
  })
})
