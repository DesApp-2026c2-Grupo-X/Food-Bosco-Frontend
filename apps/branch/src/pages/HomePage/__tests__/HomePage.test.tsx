import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { BranchStock, Order, OrderStatus } from '@repo/domain'
import { useBranchOrders, useBranchStock } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { HomePage } from '../index'

vi.mock('@repo/api', () => ({
  useBranchOrders: vi.fn(),
  useBranchStock: vi.fn(),
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

const mockStock = (
  stock: BranchStock[] = [],
  extra: Partial<ReturnType<typeof useBranchStock>> = {},
) => {
  vi.mocked(useBranchStock).mockReturnValue({
    stock,
    isLoading: false,
    isAdjusting: false,
    adjust: vi.fn().mockResolvedValue(undefined),
    ...extra,
  })
}

describe('HomePage', () => {
  beforeEach(() => {
    mockStock([])
  })

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

  it('renders low stock alerts for the branch and adjusts stock in place', async () => {
    const adjust = vi.fn().mockResolvedValue(undefined)
    mockOrders([])
    mockStock(
      [
        {
          branchId: 'b1',
          ingredientId: 'i1',
          quantity: 0,
          ingredient: { id: 'i1', name: 'Tomate', unit: 'un', minQuantity: 15, active: true },
        },
      ],
      { adjust },
    )

    renderWithProviders(<HomePage />)

    expect(screen.getByText('Alertas de stock')).toBeInTheDocument()
    expect(screen.getByText('Tomate')).toBeInTheDocument()
    expect(screen.getByText('Sin stock')).toBeInTheDocument()
    expect(screen.getByText('Disponible: 0 un · Mínimo: 15 un')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Ajustar' }))
    await userEvent.type(await screen.findByPlaceholderText('Ej: 5 o -3'), '20')
    await userEvent.tab()
    await userEvent.click(screen.getByRole('button', { name: 'Guardar ajuste' }))

    await waitFor(() => expect(adjust).toHaveBeenCalledWith('i1', 20, ''))
  })
})
