import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { AdminBranch, BranchStock } from '@repo/domain'
import { useBranches, useGlobalStock } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { StockPage } from '../index'

vi.mock('@repo/api', () => ({ useGlobalStock: vi.fn(), useBranches: vi.fn() }))

const branch: AdminBranch = {
  id: 'b1',
  name: 'Centro',
  addressText: 'Av 1',
  latitude: 0,
  longitude: 0,
  phone: null,
  active: true,
  hours: [],
}

const stockRow: BranchStock = {
  branchId: 'b1',
  ingredientId: 'i1',
  quantity: 10,
  ingredient: { id: 'i1', name: 'Queso', unit: 'kg', active: true },
}

const mockStock = (overrides: Partial<ReturnType<typeof useGlobalStock>> = {}) =>
  vi.mocked(useGlobalStock).mockReturnValue({
    stock: [stockRow],
    isLoading: false,
    isAdjusting: false,
    adjust: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useGlobalStock>)

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

describe('StockPage states', () => {
  it('shows the empty stock state', () => {
    mockStock({ stock: [] })
    mockBranches()

    renderWithProviders(<StockPage />)

    expect(screen.getByText('Sin stock')).toBeInTheDocument()
  })

  it('shows the loading state', () => {
    mockStock({ isLoading: true })
    mockBranches()
    const { container } = renderWithProviders(<StockPage />)

    expect(container.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
  })

  it('disables the adjust action while adjusting', () => {
    mockStock({ isAdjusting: true })
    mockBranches()

    renderWithProviders(<StockPage />)

    expect(screen.getByText('Ajustar').closest('button')).toBeDisabled()
  })

  it('falls back to Sucursal id when the branch is unknown', () => {
    mockStock({ stock: [{ ...stockRow, branchId: 'b9' }] })
    mockBranches()

    renderWithProviders(<StockPage />)

    expect(screen.getByText('Sucursal b9')).toBeInTheDocument()
  })

  it('clears the selection when the modal closes', async () => {
    mockStock()
    mockBranches()

    renderWithProviders(<StockPage />)

    await userEvent.click(screen.getByRole('button', { name: 'Ajustar' }))
    expect(await screen.findByText('Ajustar stock')).toBeInTheDocument()

    const closeTrigger = document.querySelector('[data-part="close-trigger"]') as HTMLElement
    await userEvent.click(closeTrigger)

    await waitFor(() => expect(screen.queryByText('Ajustar stock')).not.toBeInTheDocument())
  })
})
