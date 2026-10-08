import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Order } from '@repo/domain'
import { useBranchOrders } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { HomePage } from '../index'

vi.mock('@repo/api', () => ({
  useBranchOrders: vi.fn(),
}))

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60000).toISOString()

const makeOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'o1',
  number: '101',
  clientId: 'c1',
  branchId: 'b1',
  deliveryAddress: { text: 'Av. Siempreviva 742', latitude: 0, longitude: 0 },
  status: 'PENDING',
  total: 2500,
  estimatedDeliveryAt: null,
  createdAt: minutesAgo(5),
  statusHistory: [],
  availableTransitions: [],
  client: null,
  items: [],
  ...overrides,
})

const mockOrders = (orders: Order[], isLoading = false) => {
  vi.mocked(useBranchOrders).mockReturnValue({ orders, isLoading })
}

describe('HomePage states', () => {
  it('renders neither the empty state nor order rows while loading', () => {
    mockOrders([], true)
    renderWithProviders(<HomePage />)

    expect(screen.queryByText('Sin pedidos activos')).not.toBeInTheDocument()
    expect(screen.queryByText('Pendiente')).not.toBeInTheDocument()
    expect(screen.getByText('Pedidos que requieren atención')).toBeInTheDocument()
  })

  it('applies the elapsed tone thresholds for 15 and 30 minutes', () => {
    mockOrders([
      makeOrder({ id: 'o1', number: '101', createdAt: minutesAgo(10) }),
      makeOrder({ id: 'o2', number: '102', createdAt: minutesAgo(20) }),
      makeOrder({ id: 'o3', number: '103', createdAt: minutesAgo(40) }),
    ])
    renderWithProviders(<HomePage />)

    expect(getComputedStyle(screen.getByText('hace 10 min')).color).toContain('muted')
    expect(getComputedStyle(screen.getByText('hace 20 min')).color).toContain('warning')
    expect(getComputedStyle(screen.getByText('hace 40 min')).color).toContain('danger')
  })

  it('falls back to Cliente when the order has no client', () => {
    mockOrders([makeOrder({ client: null })])
    renderWithProviders(<HomePage />)

    expect(
      screen.getByText((_, element) => element?.textContent === '#101 · Cliente'),
    ).toBeInTheDocument()
  })
})
