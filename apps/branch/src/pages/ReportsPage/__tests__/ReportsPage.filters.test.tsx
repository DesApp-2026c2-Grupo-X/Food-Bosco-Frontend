import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReportFilter } from '@repo/domain'
import { useProductReports, useReportsOverview } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { ReportsPage } from '../index'

vi.mock('@repo/api', () => ({
  useReportsOverview: vi.fn(),
  useProductReports: vi.fn(),
}))

const mockOverview = () => {
  vi.mocked(useReportsOverview).mockReturnValue({
    overview: null,
    isLoading: false,
    error: false,
    refetch: vi.fn(),
  })
}

const mockProductReports = () => {
  vi.mocked(useProductReports).mockReturnValue({
    bestSellers: [],
    leastSold: [],
    outOfStock: [],
    highestRevenue: [],
    isLoading: false,
    error: false,
  })
}

const lastFilter = (): ReportFilter | undefined =>
  vi.mocked(useReportsOverview).mock.calls.at(-1)?.[0]

describe('ReportsPage filters', () => {
  beforeEach(() => {
    mockOverview()
    mockProductReports()
  })

  it('starts with the month preset', () => {
    renderWithProviders(<ReportsPage />)

    expect(lastFilter()).toMatchObject({ groupBy: 'MONTH', branchId: undefined, status: undefined })
  })

  it('recomputes the filter when the period preset changes', async () => {
    renderWithProviders(<ReportsPage />)

    await userEvent.selectOptions(screen.getAllByRole('combobox')[0], 'day')

    expect(lastFilter()).toMatchObject({ groupBy: 'DAY' })
  })

  it('uses the custom from and to dates', async () => {
    const { container } = renderWithProviders(<ReportsPage />)

    await userEvent.selectOptions(screen.getAllByRole('combobox')[0], 'custom')

    const dateInputs = container.querySelectorAll<HTMLInputElement>('input[type="date"]')
    expect(dateInputs).toHaveLength(2)

    fireEvent.change(dateInputs[0], { target: { value: '2025-03-01' } })
    fireEvent.change(dateInputs[1], { target: { value: '2025-03-10' } })

    const filter = lastFilter()
    expect(new Date(filter?.from as string).getDate()).toBe(1)
    expect(new Date(filter?.to as string).getDate()).toBe(10)
  })

  it('applies the status filter', async () => {
    renderWithProviders(<ReportsPage />)

    await userEvent.selectOptions(screen.getAllByRole('combobox')[1], 'DELIVERED')

    expect(lastFilter()).toMatchObject({ status: 'DELIVERED' })
  })

  it('does not render the branch filter for the branch scope', () => {
    renderWithProviders(<ReportsPage />)

    expect(screen.queryByText('Sucursal')).not.toBeInTheDocument()
    expect(screen.getAllByRole('combobox')).toHaveLength(2)
  })
})
