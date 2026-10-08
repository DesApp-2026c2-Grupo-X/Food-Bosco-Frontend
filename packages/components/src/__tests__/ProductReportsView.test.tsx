import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { OutOfStockRow, ProductReportRow } from '@repo/domain'
import { useProductReports } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { ProductReportsView } from '../ProductReportsView'

vi.mock('@repo/api', () => ({ useProductReports: vi.fn() }))

const outOfStockRow = {
  product: { id: 'p1', name: 'Burger sin queso', categoryId: 'c1', price: 100 },
  category: { id: 'c1', name: 'Comida', active: true },
  quantity: 0,
} as unknown as OutOfStockRow

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
