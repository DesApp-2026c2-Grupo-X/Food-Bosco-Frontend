import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { AdminBranch, BranchStock } from '@repo/domain'
import { useBranches, useGlobalStock } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { StockPage } from '../index'

vi.mock('@repo/api', () => ({ useGlobalStock: vi.fn(), useBranches: vi.fn() }))

const centro: AdminBranch = {
  id: 'b1',
  name: 'Centro',
  addressText: 'Av 1',
  latitude: 0,
  longitude: 0,
  phone: null,
  active: true,
  hours: [],
}

const norte: AdminBranch = {
  id: 'b2',
  name: 'Norte',
  addressText: 'Av 2',
  latitude: 1,
  longitude: 1,
  phone: null,
  active: true,
  hours: [],
}

const stockRows: BranchStock[] = [
  {
    branchId: 'b1',
    ingredientId: 'i1',
    quantity: 10,
    ingredient: { id: 'i1', name: 'Queso', unit: 'kg', active: true },
  },
  {
    branchId: 'b2',
    ingredientId: 'i2',
    quantity: 5,
    ingredient: { id: 'i2', name: 'Pan', unit: 'un', active: true },
  },
]

const mockStock = (overrides: Partial<ReturnType<typeof useGlobalStock>> = {}) =>
  vi.mocked(useGlobalStock).mockReturnValue({
    stock: stockRows,
    isLoading: false,
    isAdjusting: false,
    adjust: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useGlobalStock>)

const mockBranches = () =>
  vi.mocked(useBranches).mockReturnValue({
    branches: [centro, norte],
    isLoading: false,
    isMutating: false,
    create: vi.fn(),
    update: vi.fn(),
    toggle: vi.fn(),
    saveHours: vi.fn(),
  } as unknown as ReturnType<typeof useBranches>)

describe('StockPage (admin) — filtro por sucursal', () => {
  it('F-20: filtra las filas por la sucursal seleccionada', async () => {
    mockStock()
    mockBranches()
    renderWithProviders(<StockPage />)

    expect(screen.getByText('Queso')).toBeInTheDocument()
    expect(screen.getByText('Pan')).toBeInTheDocument()

    await userEvent.selectOptions(screen.getByRole('combobox'), 'b1')

    await waitFor(() => expect(screen.queryByText('Pan')).not.toBeInTheDocument())
    expect(screen.getByText('Queso')).toBeInTheDocument()
  })

  it('F-21: ajusta usando el branchId de la fila seleccionada', async () => {
    const adjust = vi.fn().mockResolvedValue(undefined)
    mockStock({ adjust })
    mockBranches()
    renderWithProviders(<StockPage />)

    await userEvent.click(screen.getAllByRole('button', { name: 'Ajustar' })[1] as HTMLElement)
    await userEvent.type(await screen.findByPlaceholderText('Ej: 5 o -3'), '-2')
    await userEvent.tab()
    await userEvent.click(screen.getByRole('button', { name: 'Guardar ajuste' }))

    await waitFor(() => expect(adjust).toHaveBeenCalledWith('b2', 'i2', -2, ''))
  })
})
