import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Category } from '@repo/domain'
import { useAdminCategories } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { CategoriesPage } from '../index'

vi.mock('@repo/api', () => ({ useAdminCategories: vi.fn() }))

const categories: Category[] = [
  { id: 'c1', name: 'Hamburguesas', active: true },
  { id: 'c2', name: 'Bebidas', active: false },
]

const mockCategories = (overrides: Partial<ReturnType<typeof useAdminCategories>> = {}) =>
  vi.mocked(useAdminCategories).mockReturnValue({
    categories,
    isLoading: false,
    isMutating: false,
    create: vi.fn(),
    update: vi.fn(),
    toggle: vi.fn(),
    remove: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useAdminCategories>)

describe('CategoriesPage filters', () => {
  it('filters by search text', async () => {
    mockCategories()
    renderWithProviders(<CategoriesPage />)

    await userEvent.type(screen.getByPlaceholderText('Buscar categoría...'), 'Beb')

    expect(screen.getByText('Bebidas')).toBeInTheDocument()
    expect(screen.queryByText('Hamburguesas')).not.toBeInTheDocument()
  })

  it('filters by active status', async () => {
    mockCategories()
    renderWithProviders(<CategoriesPage />)

    await userEvent.selectOptions(screen.getByRole('combobox'), 'inactive')

    expect(screen.getByText('Bebidas')).toBeInTheDocument()
    expect(screen.queryByText('Hamburguesas')).not.toBeInTheDocument()
  })

  it('shows the empty state when no category matches the filters', async () => {
    mockCategories()
    renderWithProviders(<CategoriesPage />)

    await userEvent.type(screen.getByPlaceholderText('Buscar categoría...'), 'zzz')

    expect(screen.getByText('Sin categorías')).toBeInTheDocument()
  })

  it('shows the loading skeleton instead of rows', () => {
    mockCategories({ isLoading: true })
    const { container } = renderWithProviders(<CategoriesPage />)

    expect(container.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
    expect(screen.queryByText('Hamburguesas')).not.toBeInTheDocument()
  })

  it('disables the row actions while mutating', () => {
    mockCategories({ isMutating: true })
    renderWithProviders(<CategoriesPage />)

    const toggle = screen.getByLabelText('Estado de Hamburguesas') as HTMLLabelElement
    expect(toggle.control).toBeDisabled()
  })
})
