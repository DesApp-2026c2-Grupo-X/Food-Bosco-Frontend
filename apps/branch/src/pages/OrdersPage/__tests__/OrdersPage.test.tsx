import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Order, OrderStatus } from '@repo/domain'
import { useBranchOrders } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { OrdersPage } from '../index'

vi.mock('@repo/api', () => ({
  useBranchOrders: vi.fn(),
}))

const makeOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'o1',
  number: '101',
  clientId: 'c1',
  branchId: 'b1',
  branch: { id: 'b1', name: 'Centro' },
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

describe('OrdersPage', () => {
  beforeEach(() => {
    mockOrders([makeOrder()])
  })

  it('renders the branch orders with client, status and total', () => {
    renderWithProviders(<OrdersPage />)

    expect(screen.getByText('#101')).toBeInTheDocument()
    expect(screen.getByText('Ana Perez')).toBeInTheDocument()
    expect(within(screen.getByRole('table')).getByText('Pendiente')).toBeInTheDocument()
    expect(screen.getByText(/2\.500/)).toBeInTheDocument()
  })

  it('shows an empty state when there are no orders', () => {
    mockOrders([])
    renderWithProviders(<OrdersPage />)

    expect(screen.getByText('Sin pedidos')).toBeInTheDocument()
  })

  it('links each order to its detail page', () => {
    renderWithProviders(<OrdersPage />)

    expect(screen.getByRole('link', { name: 'Ver' })).toHaveAttribute('href', '/orders/o1')
  })

  it('filters the list by status', async () => {
    mockOrders([
      makeOrder({ id: 'o1', number: '101', status: 'PENDING' }),
      makeOrder({
        id: 'o2',
        number: '102',
        status: 'DELIVERED',
        client: {
          id: 'c2',
          email: 'beto@b.com',
          role: 'customer',
          firstName: 'Beto',
          lastName: 'Diaz',
          phone: '456',
          active: true,
          createdAt: '2025-01-01T00:00:00Z',
        },
      }),
    ])
    renderWithProviders(<OrdersPage />)

    expect(screen.getByText('#101')).toBeInTheDocument()
    expect(screen.getByText('#102')).toBeInTheDocument()

    await userEvent.selectOptions(screen.getByRole('combobox'), 'DELIVERED' as OrderStatus)

    expect(screen.queryByText('#101')).not.toBeInTheDocument()
    expect(screen.getByText('#102')).toBeInTheDocument()
  })
})
