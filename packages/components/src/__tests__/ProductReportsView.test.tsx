import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { OutOfStockRow, ProductReportRow, ReportFilter } from '@repo/domain'
import { useProductReports } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { ProductReportsView } from '../ProductReportsView'

vi.mock('@repo/api', () => ({ useProductReports: vi.fn() }))

const outOfStockRow = {
  product: { id: 'p1', name: 'Burger sin queso', categoryId: 'c1', price: 100 },
  category: { id: 'c1', name: 'Comida', active: true },
  quantity: 0,
} as unknown as OutOfStockRow

const productReportRow = (name: string, quantity: number, revenue: number) =>
  ({
    position: 1,
    product: { id: name, categoryId: 'c1', name, price: 100 },
    category: { id: 'c1', name: 'Comida', active: true },
    quantity,
    revenue,
  }) as unknown as ProductReportRow

const mockReports = (overrides: Partial<ReturnType<typeof useProductReports>> = {}) =>
  vi.mocked(useProductReports).mockReturnValue({
    bestSellers: [] as ProductReportRow[],
    leastSold: [],
    outOfStock: [outOfStockRow],
    highestRevenue: [],
    isLoading: false,
    error: false,
    ...overrides,
  })

describe('ProductReportsView — tab Sin stock', () => {
  beforeEach(() => mockReports())

  it('F-23: renderiza los productos sin stock', async () => {
    renderWithProviders(<ProductReportsView description="d" embedded />)

    await userEvent.click(screen.getByRole('tab', { name: 'Sin stock' }))

    expect(await screen.findByText('Burger sin queso')).toBeInTheDocument()
    expect(screen.getByText('Comida')).toBeInTheDocument()
  })

  it('F-23b: muestra el vacío cuando no hay productos sin stock', async () => {
    mockReports({ outOfStock: [] })
    renderWithProviders(<ProductReportsView description="d" embedded />)

    await userEvent.click(screen.getByRole('tab', { name: 'Sin stock' }))

    expect(await screen.findByText('Sin productos sin stock')).toBeInTheDocument()
  })
})

describe('ProductReportsView — otras pestañas', () => {
  beforeEach(() =>
    mockReports({
      bestSellers: [productReportRow('Milanesa', 10, 1000)],
      leastSold: [productReportRow('Ensalada', 1, 100)],
      highestRevenue: [productReportRow('Pizza', 5, 9000)],
    }),
  )

  it('muestra los más vendidos por defecto', () => {
    renderWithProviders(<ProductReportsView description="d" embedded />)

    expect(screen.getByText('Milanesa')).toBeInTheDocument()
  })

  it('muestra los menos vendidos', async () => {
    renderWithProviders(<ProductReportsView description="d" embedded />)

    await userEvent.click(screen.getByRole('tab', { name: 'Menos vendidos' }))

    expect(await screen.findByText('Ensalada')).toBeInTheDocument()
  })

  it('muestra los de mayor facturación', async () => {
    renderWithProviders(<ProductReportsView description="d" embedded />)

    await userEvent.click(screen.getByRole('tab', { name: 'Mayor facturación' }))

    expect(await screen.findByText('Pizza')).toBeInTheDocument()
  })
})

describe('ProductReportsView — error y filtro', () => {
  beforeEach(() => mockReports())

  it('muestra el estado de error', () => {
    mockReports({ error: true })

    renderWithProviders(<ProductReportsView description="d" embedded />)

    expect(screen.getAllByText('Ocurrió un error').length).toBeGreaterThan(0)
  })

  it('reenvía el filtro a useProductReports', () => {
    const filter: ReportFilter = { from: '2025-01-01', to: '2025-01-31', groupBy: 'DAY' }

    renderWithProviders(<ProductReportsView description="d" embedded filter={filter} />)

    expect(useProductReports).toHaveBeenCalledWith(filter)
  })
})
