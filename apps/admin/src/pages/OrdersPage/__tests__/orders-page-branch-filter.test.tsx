import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Order } from '@repo/domain'
import { useGlobalOrders } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { OrdersPage } from '../index'

vi.mock('@repo/api', () => ({ useGlobalOrders: vi.fn() }))

const baseBranch = {
  id: 'b1',
  name: 'Centro',
  addressText: 'Av. Vergara 1200',
  latitude: -34.6,
  longitude: -58.6,
  phone: null,
  active: true,
  hours: [],
}

const baseClient = {
  id: 'c1',
  email: 'ana@x.com',
  role: 'customer' as const,
  firstName: 'Ana',
  lastName: 'Pérez',
  phone: '123',
  active: true,
  createdAt: '2025-01-01T09:00:00',
}

const order = (overrides: Partial<Order>): Order => ({
  id: 'o1',
  number: '123',
  clientId: 'c1',
  branchId: 'b1',
  branch: baseBranch,
  client: baseClient,
  deliveryAddress: { text: 'Casa', latitude: -34.6, longitude: -58.6 },
  status: 'PENDING',
  total: 2500,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T09:00:00',
  items: [],
  statusHistory: [],
  availableTransitions: [],
  ...overrides,
})

const centro = order({ id: 'o1', number: '123', branchId: 'b1', status: 'PENDING' })
const norte = order({
  id: 'o2',
  number: '456',
  branchId: 'b2',
  status: 'DELIVERED',
  branch: { ...baseBranch, id: 'b2', name: 'Norte' },
  client: { ...baseClient, firstName: 'Beto', lastName: 'Lima' },
})
const centroDelivered = order({
  id: 'o3',
  number: '789',
  branchId: 'b1',
  status: 'DELIVERED',
  client: { ...baseClient, firstName: 'Carla', lastName: 'Sosa' },
})

const mockOrders = (overrides: Partial<ReturnType<typeof useGlobalOrders>> = {}) =>
  vi.mocked(useGlobalOrders).mockReturnValue({
    orders: [centro, norte, centroDelivered],
    isLoading: false,
    ...overrides,
  } as ReturnType<typeof useGlobalOrders>)

const statusSelect = () => screen.getAllByRole('combobox')[0]
const branchSelect = () => screen.getAllByRole('combobox')[1]

describe('OrdersPage branch filter', () => {
  it('filters the orders by branch', async () => {
    mockOrders()

    renderWithProviders(<OrdersPage />)

    await userEvent.selectOptions(branchSelect(), 'b2')

    expect(screen.getByText('#456')).toBeInTheDocument()
    expect(screen.queryByText('#123')).not.toBeInTheDocument()
    expect(screen.queryByText('#789')).not.toBeInTheDocument()
  })

  it('combines branch, status and search filters', async () => {
    mockOrders()

    renderWithProviders(<OrdersPage />)

    await userEvent.selectOptions(branchSelect(), 'b1')
    await userEvent.selectOptions(statusSelect(), 'DELIVERED')
    await userEvent.type(screen.getByPlaceholderText('Número o cliente...'), 'Carla')

    expect(screen.getByText('#789')).toBeInTheDocument()
    expect(screen.queryByText('#123')).not.toBeInTheDocument()
    expect(screen.queryByText('#456')).not.toBeInTheDocument()
  })

  it('shows the loading skeleton instead of rows', () => {
    mockOrders({ isLoading: true })

    renderWithProviders(<OrdersPage />)

    expect(screen.getByText('Número')).toBeInTheDocument()
    expect(screen.queryByText('#123')).not.toBeInTheDocument()
  })

  it('shows the empty state when the filters match no orders', async () => {
    mockOrders()

    renderWithProviders(<OrdersPage />)

    await userEvent.selectOptions(branchSelect(), 'b2')
    await userEvent.selectOptions(statusSelect(), 'PENDING')

    expect(screen.getByText('Sin pedidos')).toBeInTheDocument()
  })
})
