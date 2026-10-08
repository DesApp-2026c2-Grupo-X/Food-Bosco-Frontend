import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { Product, RecipeItem } from '@repo/domain'
import { useAdminCategories, useImageUpload, useIngredients, useProductEditor } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { ProductEditPage } from '../index'

vi.mock('@repo/api', () => ({
  useProductEditor: vi.fn(),
  useAdminCategories: vi.fn(),
  useIngredients: vi.fn(),
  useImageUpload: vi.fn(),
}))

const panItem: RecipeItem = {
  id: 'r1',
  ingredientId: 'i1',
  quantity: 2,
  ingredient: { id: 'i1', name: 'Pan', unit: 'un', active: true },
}

const baseProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'p1',
  categoryId: 'c1',
  name: 'Hamburguesa Clásica',
  description: 'Rica',
  price: 1500,
  image: null,
  available: true,
  configGroups: [],
  recipe: [],
  ...overrides,
})

interface Handlers {
  addRecipeItem: ReturnType<typeof vi.fn>
  updateRecipeItem: ReturnType<typeof vi.fn>
  removeRecipeItem: ReturnType<typeof vi.fn>
}

const renderEdit = (product: Product): Handlers => {
  const handlers: Handlers = {
    addRecipeItem: vi.fn().mockResolvedValue(undefined),
    updateRecipeItem: vi.fn().mockResolvedValue(undefined),
    removeRecipeItem: vi.fn().mockResolvedValue(undefined),
  }

  vi.mocked(useProductEditor).mockReturnValue({
    product,
    isLoading: false,
    isMutating: false,
    save: vi.fn(),
    addGroup: vi.fn(),
    updateGroup: vi.fn(),
    removeGroup: vi.fn(),
    addOption: vi.fn(),
    updateOption: vi.fn(),
    removeOption: vi.fn(),
    ...handlers,
  } as ReturnType<typeof useProductEditor>)

  vi.mocked(useAdminCategories).mockReturnValue({
    categories: [{ id: 'c1', name: 'Hamburguesas', active: true }],
    isLoading: false,
    isMutating: false,
    create: vi.fn(),
    update: vi.fn(),
    toggle: vi.fn(),
    remove: vi.fn(),
  } as ReturnType<typeof useAdminCategories>)

  vi.mocked(useIngredients).mockReturnValue({
    ingredients: [{ id: 'i1', name: 'Pan', unit: 'un', active: true }],
    isLoading: false,
    isMutating: false,
    create: vi.fn(),
    update: vi.fn(),
    toggle: vi.fn(),
  } as ReturnType<typeof useIngredients>)

  vi.mocked(useImageUpload).mockReturnValue({ uploadImage: vi.fn(), isUploading: false })

  renderWithProviders(
    <Routes>
      <Route path="/products/:productId/edit" element={<ProductEditPage />} />
    </Routes>,
    { route: '/products/p1/edit' },
  )

  return handlers
}

const openRecipe = async () => {
  await userEvent.click(screen.getByRole('tab', { name: 'Receta' }))
}

const dialog = () => screen.getByRole('dialog')

describe('ProductEditPage recipe tab', () => {
  it('shows the empty state when there are no ingredients', async () => {
    renderEdit(baseProduct())
    await openRecipe()

    expect(screen.getByText('Sin ingredientes')).toBeInTheDocument()
    expect(
      screen.getByText('Definí qué ingredientes (y cuánto) usa este producto.'),
    ).toBeInTheDocument()
  })

  it('falls back to a dash when the ingredient is missing', async () => {
    renderEdit(
      baseProduct({ recipe: [{ id: 'r1', ingredientId: 'i9', quantity: 2, ingredient: null }] }),
    )
    await openRecipe()

    expect(screen.getByText('2 —')).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('adds a recipe item', async () => {
    const handlers = renderEdit(baseProduct({ recipe: [panItem] }))
    await openRecipe()

    await userEvent.click(screen.getByRole('button', { name: 'Agregar ingrediente' }))
    const modal = dialog()

    await userEvent.selectOptions(within(modal).getByLabelText('Ingrediente'), 'i1')
    await userEvent.type(within(modal).getByPlaceholderText('Ej: 1'), '2')
    await userEvent.click(within(modal).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(handlers.addRecipeItem).toHaveBeenCalledWith({ ingredientId: 'i1', quantity: 2 }),
    )
  })

  it('edits a recipe item with preloaded values', async () => {
    const handlers = renderEdit(baseProduct({ recipe: [panItem] }))
    await openRecipe()

    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))
    const modal = dialog()

    expect(within(modal).getByPlaceholderText('Ej: 1')).toHaveValue('2')

    await userEvent.clear(within(modal).getByPlaceholderText('Ej: 1'))
    await userEvent.type(within(modal).getByPlaceholderText('Ej: 1'), '3')
    await userEvent.click(within(modal).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(handlers.updateRecipeItem).toHaveBeenCalledWith('r1', {
        ingredientId: 'i1',
        quantity: 3,
      }),
    )
  })

  it('removes a recipe item', async () => {
    const handlers = renderEdit(baseProduct({ recipe: [panItem] }))
    await openRecipe()

    await userEvent.click(screen.getByRole('button', { name: 'Quitar' }))

    await waitFor(() => expect(handlers.removeRecipeItem).toHaveBeenCalledWith('r1'))
  })
})
