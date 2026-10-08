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

const renderEdit = (route = '/categories/c1/edit') =>
  renderWithProviders(
    <Routes>
      <Route path="/categories/:categoryId/edit" element={<CategoriesPage />} />
      <Route path="/categories" element={<div>Volver a categorías</div>} />
    </Routes>,
    { route },
  )

describe('CategoriesPage edit flow', () => {
  it('prefills the modal and calls update with the edited name', async () => {
    const update = vi.fn().mockResolvedValue(undefined)
    mockCategories({ update })

    renderEdit()

    expect(await screen.findByText('Editar categoría')).toBeInTheDocument()
    const name = screen.getByLabelText('Nombre')
    expect(name).toHaveValue('Hamburguesas')

    await userEvent.clear(name)
    await userEvent.type(name, 'Bebidas')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith('c1', { name: 'Bebidas', active: true }),
    )
  })

  it('does not open the modal when the category does not exist', () => {
    mockCategories()

    renderEdit('/categories/missing/edit')

    expect(screen.queryByText('Editar categoría')).not.toBeInTheDocument()
  })

  it('navigates back to the list when the modal is closed', async () => {
    mockCategories()

    renderEdit()
    await screen.findByText('Editar categoría')

    const closeTrigger = document.querySelector('[data-part="close-trigger"]') as HTMLElement
    await userEvent.click(closeTrigger)

    expect(await screen.findByText('Volver a categorías')).toBeInTheDocument()
  })
})
