import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type {
  AdminBranch,
  OutOfStockRow,
  Product,
  ProductReportRow,
  ReportsOverview,
} from '@repo/domain'
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

const product = (id: string, name: string): Product => ({
  id,
  categoryId: 'c1',
  name,
  description: '',
  price: 1000,
  image: null,
  available: true,
  configGroups: [],
  recipe: [],
})

const reportRow = (id: string, name: string, quantity: number): ProductReportRow => ({
  position: 1,
  product: product(id, name),
  category: { id: 'c1', name: 'Principales', active: true },
  quantity,
})

const revenueRow = (id: string, name: string, revenue: number): ProductReportRow => ({
  position: 1,
  product: product(id, name),
  category: { id: 'c1', name: 'Principales', active: true },
  revenue,
})

const outOfStockRow = (id: string, name: string): OutOfStockRow => ({
  product: product(id, name),
  category: { id: 'c1', name: 'Principales', active: true },
  quantity: 0,
})

const overview: ReportsOverview = {
  period: { from: '2025-01-01', to: '2025-01-31' },
  kpis: {
    totalRevenue: 15000,
    totalOrders: 25,
    averageTicket: 600,
    cancelledOrders: 2,
    bestSellingProduct: { productId: 'p0', name: 'Producto destacado', quantity: 3, revenue: 1000 },
    topBranch: { branchId: 'b1', branchName: 'Centro', revenue: 15000, orders: 25 },
  },
  variation: { revenuePct: 10, ordersPct: 5, averageTicketPct: 2 },
  salesSeries: [],
  ordersByStatus: [],
  topProducts: [],
  branchPerformance: [],
}

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

const mockOverview = () =>
  vi.mocked(useReportsOverview).mockReturnValue({
    overview,
    isLoading: false,
    error: false,
    refetch: vi.fn(),
  } as ReturnType<typeof useReportsOverview>)

const mockProductReports = () =>
  vi.mocked(useProductReports).mockReturnValue({
    bestSellers: [reportRow('p1', 'Hamburguesa', 12)],
    leastSold: [reportRow('p2', 'Ensalada', 1)],
    outOfStock: [outOfStockRow('p3', 'Pizza')],
    highestRevenue: [revenueRow('p4', 'Milanesa', 9000)],
    isLoading: false,
    error: false,
  } as ReturnType<typeof useProductReports>)

const activePanel = () =>
  within(document.querySelector('[role="tabpanel"][data-selected]') as HTMLElement)

describe('ReportsPage product tabs', () => {
  it('shows the best sellers data by default', () => {
    mockBranches()
    mockOverview()
    mockProductReports()

    renderWithProviders(<ReportsPage />)

    expect(activePanel().getByText('Hamburguesa')).toBeInTheDocument()
    expect(activePanel().getByText('Cantidad vendida')).toBeInTheDocument()
  })

  it('shows the least sold products when its tab is selected', async () => {
    mockBranches()
    mockOverview()
    mockProductReports()

    renderWithProviders(<ReportsPage />)

    await userEvent.click(screen.getByRole('tab', { name: 'Menos vendidos' }))

    expect(activePanel().getByText('Ensalada')).toBeInTheDocument()
    expect(activePanel().queryByText('Hamburguesa')).not.toBeInTheDocument()
  })

  it('shows the out of stock products when its tab is selected', async () => {
    mockBranches()
    mockOverview()
    mockProductReports()

    renderWithProviders(<ReportsPage />)

    await userEvent.click(screen.getByRole('tab', { name: 'Sin stock' }))

    expect(activePanel().getByText('Pizza')).toBeInTheDocument()
    expect(activePanel().getByText('Cantidad')).toBeInTheDocument()
  })

  it('shows the highest revenue products with their billing when its tab is selected', async () => {
    mockBranches()
    mockOverview()
    mockProductReports()

    renderWithProviders(<ReportsPage />)

    await userEvent.click(screen.getByRole('tab', { name: 'Mayor facturación' }))

    expect(activePanel().getByText('Milanesa')).toBeInTheDocument()
    expect(activePanel().getByText('Facturación')).toBeInTheDocument()
    expect(activePanel().getByText(/9\.000/)).toBeInTheDocument()
  })
})
