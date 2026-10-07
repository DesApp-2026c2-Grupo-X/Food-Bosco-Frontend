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

describe('IngredientsPage', () => {
  it('renders the ingredients list', () => {
    mockIngredients()

    renderWithProviders(<IngredientsPage />)

    expect(screen.getByText('Pan')).toBeInTheDocument()
    expect(screen.getByText('un')).toBeInTheDocument()
  })

  it('shows the empty state', () => {
    mockIngredients({ ingredients: [] })

    renderWithProviders(<IngredientsPage />)

    expect(screen.getByText('Sin ingredientes')).toBeInTheDocument()
  })

  it('creates an ingredient from the modal', async () => {
    const create = vi.fn().mockResolvedValue(undefined)
    mockIngredients({ create })

    renderWithProviders(<IngredientsPage />)

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo ingrediente' }))
    await userEvent.type(await screen.findByPlaceholderText('Ej: Pan de hamburguesa'), 'Queso')
    await userEvent.type(screen.getByPlaceholderText('Ej: un, kg, l'), 'kg')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(create).toHaveBeenCalledWith({ name: 'Queso', unit: 'kg', active: true }))
  })

  it('toggles an ingredient status', async () => {
    const toggle = vi.fn()
    mockIngredients({ toggle })

    renderWithProviders(<IngredientsPage />)

    await userEvent.click(screen.getByLabelText('Estado de Pan'))

    expect(toggle).toHaveBeenCalledWith('i1', false)
  })
})
