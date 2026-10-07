import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { Category } from '@repo/domain'
import { useAdminCategories } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { CategoriesPage } from '../index'

vi.mock('@repo/api', () => ({ useAdminCategories: vi.fn() }))

const category: Category = { id: 'c1', name: 'Hamburguesas', active: true }

const mockCategories = (overrides: Partial<ReturnType<typeof useAdminCategories>> = {}) =>
  vi.mocked(useAdminCategories).mockReturnValue({
    categories: [category],
    isLoading: false,
    isMutating: false,
    create: vi.fn(),
    update: vi.fn(),
    toggle: vi.fn(),
    remove: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useAdminCategories>)

const renderCategories = () =>
  renderWithProviders(
    <Routes>
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/categories/new" element={<CategoriesPage />} />
    </Routes>,
    { route: '/categories' },
  )

describe('CategoriesPage', () => {
  it('renders the categories list', () => {
    mockCategories()

    renderCategories()

    expect(screen.getByText('Hamburguesas')).toBeInTheDocument()
  })

  it('creates a category from the modal', async () => {
    const create = vi.fn().mockResolvedValue(undefined)
    mockCategories({ create })

    renderCategories()

    await userEvent.click(screen.getByRole('button', { name: 'Nueva categoría' }))
    await userEvent.type(await screen.findByPlaceholderText('Ej: Hamburguesas'), 'Bebidas')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(create).toHaveBeenCalledWith({ name: 'Bebidas', active: true }))
  })

  it('removes a category after confirming', async () => {
    const remove = vi.fn().mockResolvedValue(undefined)
    mockCategories({ remove })

    renderCategories()

    const deleteButtons = screen.getAllByRole('button', { name: 'Eliminar' })
    await userEvent.click(deleteButtons[0])

    expect(await screen.findByText('Eliminar categoría')).toBeInTheDocument()

    const confirmButtons = screen.getAllByRole('button', { name: 'Eliminar' })
    await userEvent.click(confirmButtons[confirmButtons.length - 1])

    await waitFor(() => expect(remove).toHaveBeenCalledWith('c1'))
  })

  it('toggles the category status', async () => {
    const toggle = vi.fn()
    mockCategories({ toggle })

    renderCategories()

    await userEvent.click(screen.getByLabelText('Estado de Hamburguesas'))

    expect(toggle).toHaveBeenCalledWith('c1', false)
  })
})
