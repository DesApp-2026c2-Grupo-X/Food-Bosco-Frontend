import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { AdminBranch, ReportsOverview } from '@repo/domain'
import { useBranches, useProductReports, useReportsOverview } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { ReportsPage } from '../index'

vi.mock('@repo/api', () => ({
  useBranches: vi.fn(),
  useReportsOverview: vi.fn(),
  useProductReports: vi.fn(),
}))

const branch: AdminBranch = {
  id: 'b1',
  name: 'Centro',
  addressText: 'Av. Vergara 1200',
  latitude: -34.6,
  longitude: -58.6,
  phone: null,
  active: true,
  hours: [],
}

const overview: ReportsOverview = {
  period: { from: '2025-01-01', to: '2025-01-31' },
  kpis: {
    totalRevenue: 15000,
    totalOrders: 25,
    averageTicket: 600,
    cancelledOrders: 2,
    bestSellingProduct: {
      productId: 'p1',
      name: 'Hamburguesa',
      quantity: 10,
      revenue: 5000,
    },
    topBranch: { branchId: 'b1', branchName: 'Centro', revenue: 15000, orders: 25 },
  },
  variation: { revenuePct: 10, ordersPct: 5, averageTicketPct: 2 },
  salesSeries: [],
  ordersByStatus: [],
  topProducts: [],
  branchPerformance: [],
}

const mockOverview = (overrides: Partial<ReturnType<typeof useReportsOverview>> = {}) =>
  vi.mocked(useReportsOverview).mockReturnValue({
    overview,
    isLoading: false,
    error: false,
    refetch: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useReportsOverview>)

const mockProductReports = () =>
  vi.mocked(useProductReports).mockReturnValue({
    bestSellers: [],
    leastSold: [],
    outOfStock: [],
    highestRevenue: [],
    isLoading: false,
    error: false,
  } as ReturnType<typeof useProductReports>)

const mockBranches = () =>
  vi.mocked(useBranches).mockReturnValue({
    branches: [branch],
    isLoading: false,
    isMutating: false,
    create: vi.fn(),
    update: vi.fn(),
    toggle: vi.fn(),
    saveHours: vi.fn(),
  } as ReturnType<typeof useBranches>)

describe('ReportsPage', () => {
  it('renders the KPIs from the reports overview', () => {
    mockBranches()
    mockOverview()
    mockProductReports()

    renderWithProviders(<ReportsPage />)

    expect(screen.getByText('Reportes')).toBeInTheDocument()
    expect(screen.getByText('Ingresos')).toBeInTheDocument()
    expect(screen.getByText('Pedidos')).toBeInTheDocument()
    expect(screen.getByText('Hamburguesa')).toBeInTheDocument()
    expect(screen.getAllByText('Centro').length).toBeGreaterThan(0)
  })

  it('shows the list of products even with no sales', () => {
    mockBranches()
    mockOverview()
    mockProductReports()

    renderWithProviders(<ReportsPage />)

    expect(screen.getByText('Más vendidos')).toBeInTheDocument()
    expect(screen.getAllByText('Sin datos').length).toBeGreaterThan(0)
  })

  it('shows an error state when the overview fails', () => {
    mockBranches()
    mockOverview({ error: true, overview: null })
    mockProductReports()

    renderWithProviders(<ReportsPage />)

    expect(screen.getByText('Error de consulta')).toBeInTheDocument()
  })
})
