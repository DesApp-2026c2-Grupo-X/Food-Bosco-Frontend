import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReportsOverview } from '@repo/domain'
import { useProductReports, useReportsOverview } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { AdvancedReportsView } from '../AdvancedReportsView'

vi.mock('@repo/api', () => ({ useReportsOverview: vi.fn(), useProductReports: vi.fn() }))

const emptyOverview: ReportsOverview = {
  period: { from: '', to: '' },
  kpis: {
    totalRevenue: 0,
    totalOrders: 0,
    averageTicket: 0,
    cancelledOrders: 0,
    bestSellingProduct: null,
    topBranch: null,
  },
  variation: { revenuePct: null, ordersPct: null, averageTicketPct: null },
  salesSeries: [],
  ordersByStatus: [],
  topProducts: [],
  branchPerformance: [],
}

const mockOverview = (overrides: Partial<ReturnType<typeof useReportsOverview>> = {}) =>
  vi.mocked(useReportsOverview).mockReturnValue({
    overview: emptyOverview,
    isLoading: false,
    error: false,
    refetch: vi.fn(),
    ...overrides,
  })

const mockProductReports = () =>
  vi.mocked(useProductReports).mockReturnValue({
    bestSellers: [],
    leastSold: [],
    outOfStock: [],
    highestRevenue: [],
    isLoading: false,
    error: false,
  })

const branchOptions = [{ value: 'b1', label: 'Centro' }]

describe('AdvancedReportsView', () => {
  beforeEach(() => {
    mockOverview()
    mockProductReports()
  })

  it('usa el rango del mes por defecto y lo envía a los hooks', () => {
    renderWithProviders(<AdvancedReportsView description="d" scope="branch" />)

    const filter = vi.mocked(useReportsOverview).mock.calls[0]?.[0]
    expect(filter?.groupBy).toBe('MONTH')
    expect(new Date(filter?.from as string).getDate()).toBe(1)
    expect(vi.mocked(useProductReports).mock.calls[0]?.[0]).toEqual(filter)
  })

  it('con scope branch oculta filtro de sucursal, KPI y gráfico', () => {
    renderWithProviders(<AdvancedReportsView description="d" scope="branch" />)

    expect(screen.queryByText('Sucursal')).not.toBeInTheDocument()
    expect(screen.queryByText('Sucursal con mayor facturación')).not.toBeInTheDocument()
    expect(screen.queryByText('Comparación entre sucursales')).not.toBeInTheDocument()
  })

  it('con scope admin muestra filtro de sucursal, KPI y gráfico', () => {
    renderWithProviders(
      <AdvancedReportsView description="d" scope="admin" branchOptions={branchOptions} />,
    )

    expect(screen.getByText('Sucursal')).toBeInTheDocument()
    expect(screen.getByText('Sucursal con mayor facturación')).toBeInTheDocument()
    expect(screen.getByText('Comparación entre sucursales')).toBeInTheDocument()
  })

  it('muestra el vacío de error', () => {
    mockOverview({ error: true, overview: null })

    renderWithProviders(<AdvancedReportsView description="d" scope="branch" />)

    expect(screen.getByText('Error de consulta')).toBeInTheDocument()
  })

  it('usa los fallbacks de KPI cuando no hay overview', () => {
    mockOverview({ overview: null })

    renderWithProviders(
      <AdvancedReportsView description="d" scope="admin" branchOptions={branchOptions} />,
    )

    expect(screen.getAllByText('—')).toHaveLength(2)
    expect(screen.getByText('Producto más vendido')).toBeInTheDocument()
  })

  it('envía el branchId elegido en scope admin', async () => {
    renderWithProviders(
      <AdvancedReportsView description="d" scope="admin" branchOptions={branchOptions} />,
    )

    await userEvent.selectOptions(screen.getAllByRole('combobox')[1] as HTMLElement, 'b1')

    await waitFor(() =>
      expect(vi.mocked(useReportsOverview).mock.lastCall?.[0]?.branchId).toBe('b1'),
    )
    expect(vi.mocked(useProductReports).mock.lastCall?.[0]?.branchId).toBe('b1')
  })
})
