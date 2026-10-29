import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AdminBranch, BranchStock } from '@repo/domain'
import { useBranches, useGlobalStock } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { HomePage } from '../index'

vi.mock('@repo/api', () => ({
  useGlobalStock: vi.fn(),
  useBranches: vi.fn(),
}))

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

describe('HomePage', () => {
  beforeEach(() => {
    vi.mocked(useGlobalStock).mockReturnValue({
      stock: [],
      isLoading: false,
      isAdjusting: false,
      adjust: vi.fn().mockResolvedValue(undefined),
    })
    vi.mocked(useBranches).mockReturnValue({
      branches: [centro],
      isLoading: false,
      isMutating: false,
      create: vi.fn(),
      update: vi.fn(),
      toggle: vi.fn(),
      saveHours: vi.fn(),
    } as unknown as ReturnType<typeof useBranches>)
  })

  it('renders the page header and the quick access links', () => {
    renderWithProviders(<HomePage />)

    expect(screen.getByText('Inicio')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Categorías/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Productos/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ingredientes/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Stock/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Sucursales/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Pedidos/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Personal/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Parámetros/ })).toBeInTheDocument()
  })

  it('points each quick access link to its route', () => {
    renderWithProviders(<HomePage />)

    expect(screen.getByRole('link', { name: /Productos/ })).toHaveAttribute('href', '/products')
    expect(screen.getByRole('link', { name: /Stock/ })).toHaveAttribute('href', '/stock')
    expect(screen.getByRole('link', { name: /Sucursales/ })).toHaveAttribute('href', '/branches')
    expect(screen.getByRole('link', { name: /Pedidos/ })).toHaveAttribute('href', '/orders')
  })

  it('shows low stock alerts across branches and allows quick adjustment', async () => {
    const adjust = vi.fn().mockResolvedValue(undefined)
    const lowStock: BranchStock[] = [
      {
        branchId: 'b1',
        ingredientId: 'i1',
        quantity: 3,
        ingredient: { id: 'i1', name: 'Pan', unit: 'un', minQuantity: 20, active: true },
      },
    ]
    vi.mocked(useGlobalStock).mockReturnValue({
      stock: lowStock,
      isLoading: false,
      isAdjusting: false,
      adjust,
    })

    renderWithProviders(<HomePage />)

    expect(screen.getByText('Alertas de stock')).toBeInTheDocument()
    expect(screen.getByText('Pan · Centro')).toBeInTheDocument()
    expect(screen.getByText('Stock bajo')).toBeInTheDocument()
    expect(screen.getByText('Disponible: 3 un · Mínimo: 20 un')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Ajustar' }))
    await userEvent.type(await screen.findByPlaceholderText('Ej: 5 o -3'), '25')
    await userEvent.tab()
    await userEvent.click(screen.getByRole('button', { name: 'Guardar ajuste' }))

    await waitFor(() => expect(adjust).toHaveBeenCalledWith('b1', 'i1', 25, ''))
  })
})
