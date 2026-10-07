import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Product, ReportsOverview } from '@repo/domain'
import { useProductReports, useReportsOverview } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { ReportsPage } from '../index'

vi.mock('@repo/api', () => ({
  useReportsOverview: vi.fn(),
  useProductReports: vi.fn(),
}))

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'p1',
  categoryId: 'c1',
  name: 'Milanesa',
  description: 'Milanesa completa',
  price: 1500,
  image: null,
  available: true,
  configGroups: [],
  recipe: [],
  ...overrides,
})

const overview: ReportsOverview = {
  period: { from: '2025-01-01T00:00:00.000Z', to: '2025-01-31T00:00:00.000Z' },
  kpis: {
    totalRevenue: 1234,
    totalOrders: 12,
    averageTicket: 100,
    cancelledOrders: 1,
    bestSellingProduct: { productId: 'p1', name: 'Milanesa', quantity: 8, revenue: 500 },
    topBranch: null,
  },
  variation: { revenuePct: 10, ordersPct: null, averageTicketPct: -5 },
  salesSeries: [],
  ordersByStatus: [],
  topProducts: [],
  branchPerformance: [],
}

const mockOverview = (result: Partial<ReturnType<typeof useReportsOverview>> = {}) => {
  vi.mocked(useReportsOverview).mockReturnValue({
    overview,
    isLoading: false,
    error: false,
    refetch: vi.fn(),
    ...result,
  })
}

const mockProductReports = (
  result: Partial<ReturnType<typeof useProductReports>> = {},
) => {
  vi.mocked(useProductReports).mockReturnValue({
    bestSellers: [],
    leastSold: [],
    outOfStock: [],
    highestRevenue: [],
    isLoading: false,
    error: false,
    ...result,
  })
}

describe('ReportsPage', () => {
  beforeEach(() => {
    mockOverview()
    mockProductReports()
  })

  it('renders the KPIs and the best selling product', () => {
    renderWithProviders(<ReportsPage />)

    expect(screen.getByText('Ingresos')).toBeInTheDocument()
    expect(screen.getByText(/1\.234/)).toBeInTheDocument()
    expect(screen.getByText('Pedidos')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('Milanesa')).toBeInTheDocument()
  })

  it('shows the error state when the overview query fails', () => {
    mockOverview({ overview: null, error: true })
    renderWithProviders(<ReportsPage />)

    expect(screen.getByText('Error de consulta')).toBeInTheDocument()
  })

  it('falls back to zeroed KPIs while there is no data', () => {
    mockOverview({ overview: null })
    renderWithProviders(<ReportsPage />)

    expect(screen.getAllByText('0').length).toBeGreaterThan(0)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders the product ranking returned by the reports hook', () => {
    mockOverview({ overview: null })
    mockProductReports({
      bestSellers: [
        { position: 1, product: makeProduct({ name: 'Empanada' }), quantity: 20 },
      ],
    })
    renderWithProviders(<ReportsPage />)

    expect(screen.getByText('Empanada')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
  })
})
