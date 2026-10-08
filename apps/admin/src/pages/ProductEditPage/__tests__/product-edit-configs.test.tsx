import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { Product, ProductConfigGroup } from '@repo/domain'
import { useAdminCategories, useImageUpload, useIngredients, useProductEditor } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { ProductEditPage } from '../index'

vi.mock('@repo/api', () => ({
  useProductEditor: vi.fn(),
  useAdminCategories: vi.fn(),
  useIngredients: vi.fn(),
  useImageUpload: vi.fn(),
}))

const sizeGroup: ProductConfigGroup = {
  id: 'g1',
  name: 'Tamaño',
  type: 'single',
  required: true,
  min: 1,
  max: 1,
  options: [{ id: 'o1', name: 'Doble', extraPrice: 150, available: true }],
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
  addGroup: ReturnType<typeof vi.fn>
  updateGroup: ReturnType<typeof vi.fn>
  removeGroup: ReturnType<typeof vi.fn>
  addOption: ReturnType<typeof vi.fn>
  updateOption: ReturnType<typeof vi.fn>
  removeOption: ReturnType<typeof vi.fn>
}

const renderEdit = (product: Product): Handlers => {
  const handlers: Handlers = {
    addGroup: vi.fn().mockResolvedValue(undefined),
    updateGroup: vi.fn().mockResolvedValue(undefined),
    removeGroup: vi.fn().mockResolvedValue(undefined),
    addOption: vi.fn().mockResolvedValue(undefined),
    updateOption: vi.fn().mockResolvedValue(undefined),
    removeOption: vi.fn().mockResolvedValue(undefined),
  }

  vi.mocked(useProductEditor).mockReturnValue({
    product,
    isLoading: false,
    isMutating: false,
    save: vi.fn(),
    addRecipeItem: vi.fn(),
    updateRecipeItem: vi.fn(),
    removeRecipeItem: vi.fn(),
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

const openConfigs = async () => {
  await userEvent.click(screen.getByRole('tab', { name: 'Configuraciones' }))
}

const dialog = () => screen.getByRole('dialog')

describe('ProductEditPage configs tab', () => {
  it('shows the empty state when there are no config groups', async () => {
    renderEdit(baseProduct())
    await openConfigs()

    expect(screen.getByText('Sin configuraciones')).toBeInTheDocument()
    expect(
      screen.getByText('Agregá grupos como tamaño, sabores o adicionales.'),
    ).toBeInTheDocument()
  })

  it('renders the group metadata line', async () => {
    renderEdit(baseProduct({ configGroups: [sizeGroup] }))
    await openConfigs()

    expect(screen.getByText('Tamaño')).toBeInTheDocument()
    expect(screen.getByText(/Selección única · Obligatorio · min 1 \/ max 1/)).toBeInTheDocument()
  })

  it('creates a config group and closes the modal', async () => {
    const handlers = renderEdit(baseProduct({ configGroups: [sizeGroup] }))
    await openConfigs()

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo grupo' }))
    const modal = dialog()

    await userEvent.type(within(modal).getByLabelText('Nombre'), 'Extras')
    await userEvent.selectOptions(within(modal).getByLabelText('Tipo de selección'), 'multiple')
    await userEvent.click(within(modal).getByLabelText('Grupo obligatorio'))
    await userEvent.clear(within(modal).getByPlaceholderText('0'))
    await userEvent.type(within(modal).getByPlaceholderText('0'), '1')
    await userEvent.clear(within(modal).getByPlaceholderText('1'))
    await userEvent.type(within(modal).getByPlaceholderText('1'), '3')
    await userEvent.click(within(modal).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(handlers.addGroup).toHaveBeenCalledWith({
        name: 'Extras',
        type: 'multiple',
        required: true,
        min: 1,
        max: 3,
      }),
    )
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('edits a config group with preloaded values', async () => {
    const handlers = renderEdit(baseProduct({ configGroups: [sizeGroup] }))
    await openConfigs()

    await userEvent.click(screen.getAllByRole('button', { name: 'Editar' })[0])
    const modal = dialog()

    expect(within(modal).getByLabelText('Nombre')).toHaveValue('Tamaño')
    expect(within(modal).getByLabelText('Tipo de selección')).toHaveValue('single')

    await userEvent.clear(within(modal).getByLabelText('Nombre'))
    await userEvent.type(within(modal).getByLabelText('Nombre'), 'Tamaño XL')
    await userEvent.click(within(modal).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(handlers.updateGroup).toHaveBeenCalledWith('g1', {
        name: 'Tamaño XL',
        type: 'single',
        required: true,
        min: 1,
        max: 1,
      }),
    )
  })

  it('cancels the delete confirmation without mutating', async () => {
    const handlers = renderEdit(baseProduct({ configGroups: [sizeGroup] }))
    await openConfigs()

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    const modal = dialog()
    expect(within(modal).getByText('Eliminar grupo')).toBeInTheDocument()

    await userEvent.click(within(modal).getByRole('button', { name: 'Cancelar' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(handlers.removeGroup).not.toHaveBeenCalled()
  })

  it('deletes a config group after confirming', async () => {
    const handlers = renderEdit(baseProduct({ configGroups: [sizeGroup] }))
    await openConfigs()

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    const modal = dialog()
    await userEvent.click(within(modal).getByRole('button', { name: 'Eliminar' }))

    await waitFor(() => expect(handlers.removeGroup).toHaveBeenCalledWith('g1'))
  })

  it('adds an option to a group', async () => {
    const handlers = renderEdit(baseProduct({ configGroups: [sizeGroup] }))
    await openConfigs()

    await userEvent.click(screen.getByText('+ Agregar opción'))
    const modal = dialog()

    await userEvent.type(within(modal).getByLabelText('Nombre'), 'Queso')
    await userEvent.clear(within(modal).getByPlaceholderText('0'))
    await userEvent.type(within(modal).getByPlaceholderText('0'), '100')
    await userEvent.click(within(modal).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(handlers.addOption).toHaveBeenCalledWith('g1', {
        name: 'Queso',
        extraPrice: 100,
        available: true,
      }),
    )
  })

  it('edits an existing option', async () => {
    const handlers = renderEdit(baseProduct({ configGroups: [sizeGroup] }))
    await openConfigs()

    await userEvent.click(screen.getAllByRole('button', { name: 'Editar' })[1])
    const modal = dialog()

    expect(within(modal).getByLabelText('Nombre')).toHaveValue('Doble')

    await userEvent.clear(within(modal).getByLabelText('Nombre'))
    await userEvent.type(within(modal).getByLabelText('Nombre'), 'Triple')
    await userEvent.click(within(modal).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(handlers.updateOption).toHaveBeenCalledWith('g1', 'o1', {
        name: 'Triple',
        extraPrice: 150,
        available: true,
      }),
    )
  })

  it('removes an option immediately', async () => {
    const handlers = renderEdit(baseProduct({ configGroups: [sizeGroup] }))
    await openConfigs()

    await userEvent.click(screen.getByRole('button', { name: 'Quitar' }))

    await waitFor(() => expect(handlers.removeOption).toHaveBeenCalledWith('g1', 'o1'))
  })
})
