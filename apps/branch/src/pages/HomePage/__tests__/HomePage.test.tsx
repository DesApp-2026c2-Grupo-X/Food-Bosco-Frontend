import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Order, OrderStatus } from '@repo/domain'
import { useBranchOrders } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { HomePage } from '../index'

vi.mock('@repo/api', () => ({
  useBranchOrders: vi.fn(),
}))

const makeOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'o1',
  number: '101',
  clientId: 'c1',
  branchId: 'b1',
  deliveryAddress: { text: 'Av. Siempreviva 742', latitude: 0, longitude: 0 },
  status: 'PENDING',
  total: 2500,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T10:00:00Z',
  statusHistory: [],
  availableTransitions: [],
  client: {
    id: 'c1',
    email: 'ana@b.com',
    role: 'customer',
    firstName: 'Ana',
    lastName: 'Perez',
    phone: '123',
    active: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
  items: [],
  ...overrides,
})

const mockOrders = (orders: Order[], isLoading = false) => {
  vi.mocked(useBranchOrders).mockReturnValue({ orders, isLoading })
}

describe('HomePage', () => {
  it('renders the quick access shortcuts', () => {
    mockOrders([])
    renderWithProviders(<HomePage />)

    expect(screen.getByRole('link', { name: /Pausar o reactivar/ })).toHaveAttribute(
      'href',
      '/products',
    )
    expect(screen.getByRole('link', { name: /Operar estados/ })).toHaveAttribute('href', '/orders')
    expect(screen.getByRole('link', { name: /Ingredientes del almacén/ })).toHaveAttribute(
      'href',
      '/stock',
    )
    expect(screen.getByRole('link', { name: /Reportes/ })).toHaveAttribute(
      'href',
      '/reports/products',
    )
  })

  it('shows the empty state when there are no active orders', () => {
    mockOrders([makeOrder({ status: 'DELIVERED' as OrderStatus })])
    renderWithProviders(<HomePage />)

    expect(screen.getByText('Sin pedidos activos')).toBeInTheDocument()
  })

  it('lists the orders that require attention grouped by status', () => {
    mockOrders([makeOrder({ status: 'PENDING' })])
    renderWithProviders(<HomePage />)

    expect(screen.getByText('Pendiente')).toBeInTheDocument()
    expect(screen.getByText('1 pedido')).toBeInTheDocument()
    expect(
      screen.getByText((_, element) => element?.textContent === '#101 · Ana Perez'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver' })).toHaveAttribute('href', '/orders/o1')
  })

  it('does not list orders that are not awaiting attention', () => {
    mockOrders([
      makeOrder({ id: 'o1', number: '101', status: 'PENDING' }),
      makeOrder({ id: 'o2', number: '202', status: 'CANCELLED' }),
    ])
    renderWithProviders(<HomePage />)

    expect(screen.queryByText(/202/)).not.toBeInTheDocument()
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
  })
})
