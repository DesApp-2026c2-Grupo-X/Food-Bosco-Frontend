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
  addressText: 'Av. Vergara 1200',
  latitude: -34.6,
  longitude: -58.6,
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

describe('StockPage', () => {
  it('renders the stock rows with the branch name', () => {
    mockStock()
    mockBranches()

    renderWithProviders(<StockPage />)

    expect(screen.getByText('Queso')).toBeInTheDocument()
    expect(screen.getAllByText('Centro').length).toBeGreaterThan(0)
  })

  it('validates the adjustment quantity', async () => {
    const adjust = vi.fn()
    mockStock({ adjust })
    mockBranches()

    renderWithProviders(<StockPage />)

    await userEvent.click(screen.getByRole('button', { name: 'Ajustar' }))
    expect(await screen.findByText('Ajustar stock')).toBeInTheDocument()

    await userEvent.type(screen.getByPlaceholderText('Ej: 5 o -3'), '0')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar ajuste' }))

    expect(await screen.findByText('La cantidad no puede ser 0')).toBeInTheDocument()
    expect(adjust).not.toHaveBeenCalled()
  })

  it('submits a valid adjustment', async () => {
    const adjust = vi.fn().mockResolvedValue(undefined)
    mockStock({ adjust })
    mockBranches()

    renderWithProviders(<StockPage />)

    await userEvent.click(screen.getByRole('button', { name: 'Ajustar' }))
    await userEvent.type(await screen.findByPlaceholderText('Ej: 5 o -3'), '5')
    await userEvent.type(screen.getByPlaceholderText('Conteo físico, reposición…'), 'Conteo')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar ajuste' }))

    await waitFor(() => expect(adjust).toHaveBeenCalledWith('b1', 'i1', 5, 'Conteo'))
  })
})
