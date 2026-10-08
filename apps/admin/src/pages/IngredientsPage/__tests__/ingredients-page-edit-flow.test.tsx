import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Ingredient } from '@repo/domain'
import { useIngredients } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { IngredientsPage } from '../index'

vi.mock('@repo/api', () => ({ useIngredients: vi.fn() }))

const ingredient: Ingredient = { id: 'i1', name: 'Pan', unit: 'un', active: true }

const mockIngredients = (overrides: Partial<ReturnType<typeof useIngredients>> = {}) =>
  vi.mocked(useIngredients).mockReturnValue({
    ingredients: [ingredient],
    isLoading: false,
    isMutating: false,
    create: vi.fn(),
    update: vi.fn(),
    toggle: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useIngredients>)

describe('IngredientsPage edit flow', () => {
  it('prefills the local modal and calls update', async () => {
    const update = vi.fn().mockResolvedValue(undefined)
    mockIngredients({ update })

    renderWithProviders(<IngredientsPage />)

    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))

    expect(await screen.findByText('Editar ingrediente')).toBeInTheDocument()
    const name = screen.getByLabelText('Nombre')
    expect(name).toHaveValue('Pan')
    expect(screen.getByLabelText('Unidad')).toHaveValue('un')

    await userEvent.clear(name)
    await userEvent.type(name, 'Queso')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith('i1', { name: 'Queso', unit: 'un', active: true }),
    )
  })
})
