import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { Product } from '@repo/domain'
import { useAdminCategories, useImageUpload, useIngredients, useProductEditor } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { ProductEditPage } from '../index'

vi.mock('@repo/api', () => ({
  useProductEditor: vi.fn(),
  useAdminCategories: vi.fn(),
  useIngredients: vi.fn(),
  useImageUpload: vi.fn(),
}))

const product: Product = {
  id: 'p1',
  categoryId: 'c1',
  name: 'Hamburguesa Clásica',
  description: 'Rica',
  price: 1500,
  image: null,
  available: true,
  configGroups: [
    {
      id: 'g1',
      name: 'Tamaño',
      type: 'single',
      required: true,
      min: 1,
      max: 1,
      options: [{ id: 'o1', name: 'Doble', extraPrice: 150, available: true }],
    },
  ],
  recipe: [
    {
      id: 'r1',
      ingredientId: 'i1',
      quantity: 2,
      ingredient: { id: 'i1', name: 'Pan', unit: 'un', active: true },
    },
  ],
}

const mockEditor = (overrides: Partial<ReturnType<typeof useProductEditor>> = {}) =>
  vi.mocked(useProductEditor).mockReturnValue({
    product: null,
    isLoading: false,
    isMutating: false,
    save: vi.fn(),
    addGroup: vi.fn(),
    updateGroup: vi.fn(),
    removeGroup: vi.fn(),
    addOption: vi.fn(),
    updateOption: vi.fn(),
    removeOption: vi.fn(),
    addRecipeItem: vi.fn(),
    updateRecipeItem: vi.fn(),
    removeRecipeItem: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useProductEditor>)

const mockCategories = () =>
  vi.mocked(useAdminCategories).mockReturnValue({
    categories: [{ id: 'c1', name: 'Hamburguesas', active: true }],
    isLoading: false,
    isMutating: false,
    create: vi.fn(),
    update: vi.fn(),
    toggle: vi.fn(),
    remove: vi.fn(),
  } as ReturnType<typeof useAdminCategories>)

const mockIngredients = () =>
  vi.mocked(useIngredients).mockReturnValue({
    ingredients: [{ id: 'i1', name: 'Pan', unit: 'un', active: true }],
    isLoading: false,
    isMutating: false,
    create: vi.fn(),
    update: vi.fn(),
    toggle: vi.fn(),
  } as ReturnType<typeof useIngredients>)

const mockImageUpload = () =>
  vi.mocked(useImageUpload).mockReturnValue({ uploadImage: vi.fn(), isUploading: false })

const renderNew = () =>
  renderWithProviders(
    <Routes>
      <Route path="/products/new" element={<ProductEditPage />} />
      <Route path="/products/:productId/edit" element={<div>Editar producto page</div>} />
    </Routes>,
    { route: '/products/new' },
  )

const renderEdit = () =>
  renderWithProviders(
    <Routes>
      <Route path="/products/:productId/edit" element={<ProductEditPage />} />
    </Routes>,
    { route: '/products/p1/edit' },
  )

describe('ProductEditPage', () => {
  it('creates a product from the general form', async () => {
    const save = vi.fn().mockResolvedValue('p2')
    mockEditor({ save })
    mockCategories()
    mockIngredients()
    mockImageUpload()

    renderNew()

    await userEvent.type(screen.getByPlaceholderText('Ej: Hamburguesa Clásica'), 'Milanesa')
    await userEvent.type(screen.getByPlaceholderText('Descripción del producto'), 'Rica milanesa')
    await userEvent.selectOptions(screen.getByLabelText('Categoría'), 'c1')
    await userEvent.type(screen.getByPlaceholderText('0'), '1200')

    const submit = screen.getByRole('button', { name: 'Guardar' })
    await waitFor(() => expect(submit).toBeEnabled())
    await userEvent.click(submit)

    await waitFor(() =>
      expect(save).toHaveBeenCalledWith({
        name: 'Milanesa',
        description: 'Rica milanesa',
        categoryId: 'c1',
        price: 1200,
        image: null,
        available: true,
      }),
    )
  })

  it('validates the general form and keeps the submit disabled', async () => {
    const save = vi.fn()
    mockEditor({ save })
    mockCategories()
    mockIngredients()
    mockImageUpload()

    renderNew()

    const description = screen.getByPlaceholderText('Descripción del producto')
    await userEvent.type(description, 'x')
    await userEvent.clear(description)
    await userEvent.tab()

    expect(await screen.findByText('Este campo es requerido')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled()
    expect(save).not.toHaveBeenCalled()
  })

  it('switches between the configuration and recipe tabs', async () => {
    mockEditor({ product })
    mockCategories()
    mockIngredients()
    mockImageUpload()

    renderEdit()

    expect(screen.getByLabelText('Nombre')).toHaveValue('Hamburguesa Clásica')

    await userEvent.click(screen.getByRole('tab', { name: 'Configuraciones' }))
    expect(screen.getByRole('button', { name: 'Nuevo grupo' })).toBeInTheDocument()
    expect(screen.getByText('Tamaño')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: 'Receta' }))
    expect(screen.getByRole('button', { name: 'Agregar ingrediente' })).toBeInTheDocument()
    expect(screen.getByText('Pan')).toBeInTheDocument()
  })

  it('updates the general data of an existing product', async () => {
    const save = vi.fn().mockResolvedValue('p1')
    mockEditor({ product, save })
    mockCategories()
    mockIngredients()
    mockImageUpload()

    renderEdit()

    const name = screen.getByLabelText('Nombre')
    await userEvent.clear(name)
    await userEvent.type(name, 'Hamburguesa XL')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(save).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Hamburguesa XL', categoryId: 'c1', price: 1500 }),
      ),
    )
  })
})
