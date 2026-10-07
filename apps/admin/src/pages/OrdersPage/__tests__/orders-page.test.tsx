import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { Order } from '@repo/domain'
import { useGlobalOrders } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { OrdersPage } from '../index'

vi.mock('@repo/api', () => ({ useGlobalOrders: vi.fn() }))

const order: Order = {
  id: 'o1',
  number: '123',
  clientId: 'c1',
  branchId: 'b1',
  branch: {
    id: 'b1',
    name: 'Centro',
    addressText: 'Av. Vergara 1200',
    latitude: -34.6,
    longitude: -58.6,
    phone: null,
    active: true,
    hours: [],
  },
  client: {
    id: 'c1',
    email: 'ana@x.com',
    role: 'customer',
    firstName: 'Ana',
    lastName: 'Pérez',
    phone: '123',
    active: true,
    createdAt: '2025-01-01T09:00:00',
  },
  deliveryAddress: { text: 'Casa', latitude: -34.6, longitude: -58.6 },
  status: 'PENDING',
  total: 2500,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T09:00:00',
  items: [],
  statusHistory: [],
  availableTransitions: [],
}

const mockOrders = (overrides: Partial<ReturnType<typeof useGlobalOrders>> = {}) =>
  vi.mocked(useGlobalOrders).mockReturnValue({
    orders: [order],
    isLoading: false,
    ...overrides,
  } as ReturnType<typeof useGlobalOrders>)

describe('OrdersPage', () => {
  it('renders the orders list with status and client', () => {
    mockOrders()

    renderWithProviders(<OrdersPage />)

    expect(screen.getByText('#123')).toBeInTheDocument()
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
    expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0)
    expect(screen.getByText(/2\.500/)).toBeInTheDocument()
  })

  it('shows the empty state', () => {
    mockOrders({ orders: [] })

    renderWithProviders(<OrdersPage />)

    expect(screen.getByText('Sin pedidos')).toBeInTheDocument()
  })

  it('links each order to its detail page', () => {
    mockOrders()

    renderWithProviders(<OrdersPage />)

    expect(screen.getByRole('link', { name: 'Ver' })).toHaveAttribute('href', '/orders/o1')
  })

  it('navigates to the order detail when clicking the link', async () => {
    mockOrders()

    renderWithProviders(
      <Routes>
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:orderId" element={<div>Detalle del pedido</div>} />
      </Routes>,
      { route: '/orders' },
    )

    await userEvent.click(screen.getByRole('link', { name: 'Ver' }))

    expect(await screen.findByText('Detalle del pedido')).toBeInTheDocument()
  })

  it('filters the orders by status', async () => {
    mockOrders()

    renderWithProviders(<OrdersPage />)

    await userEvent.selectOptions(screen.getAllByRole('combobox')[0], 'DELIVERED')

    expect(screen.getByText('Sin pedidos')).toBeInTheDocument()
  })
})
