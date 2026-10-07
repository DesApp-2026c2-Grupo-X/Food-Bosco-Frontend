import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { BranchStock } from '@repo/domain'
import { useBranchStock } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { StockPage } from '../index'

vi.mock('@repo/api', () => ({
  useBranchStock: vi.fn(),
}))

const PAN: BranchStock = {
  ingredientId: 'i1',
  branchId: 'b1',
  quantity: 10,
  ingredient: { id: 'i1', name: 'Pan', unit: 'un', active: true },
}

const mockStock = (
  stock: BranchStock[],
  extra: Partial<ReturnType<typeof useBranchStock>> = {},
) => {
  vi.mocked(useBranchStock).mockReturnValue({
    stock,
    isLoading: false,
    isAdjusting: false,
    adjust: vi.fn().mockResolvedValue(undefined),
    ...extra,
  })
}

describe('StockPage', () => {
  beforeEach(() => {
    mockStock([PAN])
  })

  it('renders the ingredients with their current quantity', () => {
    renderWithProviders(<StockPage />)

    expect(screen.getByText('Pan')).toBeInTheDocument()
    expect(screen.getByText('10 un')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ajustar' })).toBeInTheDocument()
  })

  it('shows an empty state when there are no ingredients', () => {
    mockStock([])
    renderWithProviders(<StockPage />)

    expect(screen.getByText('Sin ingredientes')).toBeInTheDocument()
  })

  it('opens the adjust modal with the selected ingredient', async () => {
    renderWithProviders(<StockPage />)

    await userEvent.click(screen.getByRole('button', { name: 'Ajustar' }))

    expect(await screen.findByRole('heading', { name: 'Ajustar stock' })).toBeInTheDocument()
    expect(screen.getByText(/Pan · Actual: 10 un/)).toBeInTheDocument()
  })

  it('blocks a zero adjustment and keeps the submit disabled', async () => {
    const adjust = vi.fn()
    mockStock([PAN], { adjust })
    renderWithProviders(<StockPage />)

    await userEvent.click(screen.getByRole('button', { name: 'Ajustar' }))
    await userEvent.type(screen.getByPlaceholderText('Ej: 5 o -3'), '0')
    await userEvent.tab()

    expect(await screen.findByText('La cantidad no puede ser 0')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar ajuste' })).toBeDisabled()
    expect(adjust).not.toHaveBeenCalled()
  })

  it('submits a valid adjustment and closes the modal', async () => {
    const adjust = vi.fn().mockResolvedValue(undefined)
    mockStock([PAN], { adjust })
    renderWithProviders(<StockPage />)

    await userEvent.click(screen.getByRole('button', { name: 'Ajustar' }))
    await userEvent.type(screen.getByPlaceholderText('Ej: 5 o -3'), '5')
    await userEvent.tab()
    await userEvent.type(
      screen.getByPlaceholderText('Conteo físico, reposición…'),
      'reposicion',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Guardar ajuste' }))

    await waitFor(() => expect(adjust).toHaveBeenCalledWith('i1', 5, 'reposicion'))
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Ajustar stock' })).not.toBeInTheDocument(),
    )
  })
})
