import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Ingredient } from '@repo/domain'
import { useIngredients } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { IngredientsPage } from '../index'

vi.mock('@repo/api', () => ({ useIngredients: vi.fn() }))

const ingredients: Ingredient[] = [
  { id: 'i1', name: 'Pan', unit: 'un', active: true },
  { id: 'i2', name: 'Queso', unit: 'kg', active: false },
]

const mockIngredients = (overrides: Partial<ReturnType<typeof useIngredients>> = {}) =>
  vi.mocked(useIngredients).mockReturnValue({
    ingredients,
    isLoading: false,
    isMutating: false,
    create: vi.fn(),
    update: vi.fn(),
    toggle: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useIngredients>)

describe('IngredientsPage filters', () => {
  it('filters by search text', async () => {
    mockIngredients()
    renderWithProviders(<IngredientsPage />)

    await userEvent.type(screen.getByPlaceholderText('Buscar ingrediente...'), 'Que')

    expect(screen.getByText('Queso')).toBeInTheDocument()
    expect(screen.queryByText('Pan')).not.toBeInTheDocument()
  })

  it('filters by active status', async () => {
    mockIngredients()
    renderWithProviders(<IngredientsPage />)

    await userEvent.selectOptions(screen.getByRole('combobox'), 'inactive')

    expect(screen.getByText('Queso')).toBeInTheDocument()
    expect(screen.queryByText('Pan')).not.toBeInTheDocument()
  })

  it('shows the empty state when no ingredient matches the filters', async () => {
    mockIngredients()
    renderWithProviders(<IngredientsPage />)

    await userEvent.type(screen.getByPlaceholderText('Buscar ingrediente...'), 'zzz')

    expect(screen.getByText('Sin ingredientes')).toBeInTheDocument()
  })

  it('shows the loading skeleton instead of rows', () => {
    mockIngredients({ isLoading: true })
    const { container } = renderWithProviders(<IngredientsPage />)

    expect(container.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
    expect(screen.queryByText('Pan')).not.toBeInTheDocument()
  })
})
