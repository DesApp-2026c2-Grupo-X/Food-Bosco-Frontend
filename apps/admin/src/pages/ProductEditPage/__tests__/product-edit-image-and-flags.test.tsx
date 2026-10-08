import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { useAdminCategories, useImageUpload, useIngredients, useProductEditor } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { ProductEditPage } from '../index'

vi.mock('@repo/api', () => ({
  useProductEditor: vi.fn(),
  useAdminCategories: vi.fn(),
  useIngredients: vi.fn(),
  useImageUpload: vi.fn(),
}))

interface SetupOptions {
  save?: ReturnType<typeof vi.fn>
  uploadImage?: ReturnType<typeof vi.fn>
  isUploading?: boolean
}

const setup = ({ save, uploadImage, isUploading = false }: SetupOptions = {}) => {
  vi.mocked(useProductEditor).mockReturnValue({
    product: null,
    isLoading: false,
    isMutating: false,
    save: save ?? vi.fn(),
    addGroup: vi.fn(),
    updateGroup: vi.fn(),
    removeGroup: vi.fn(),
    addOption: vi.fn(),
    updateOption: vi.fn(),
    removeOption: vi.fn(),
    addRecipeItem: vi.fn(),
    updateRecipeItem: vi.fn(),
    removeRecipeItem: vi.fn(),
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

  const upload = (uploadImage ?? vi.fn()) as (file: File) => Promise<string>
  vi.mocked(useImageUpload).mockReturnValue({ uploadImage: upload, isUploading })

  renderWithProviders(
    <Routes>
      <Route path="/products/new" element={<ProductEditPage />} />
      <Route path="/products/:productId/edit" element={<div>Editar producto page</div>} />
    </Routes>,
    { route: '/products/new' },
  )
}

const fillGeneralForm = async () => {
  await userEvent.type(screen.getByPlaceholderText('Ej: Hamburguesa Clásica'), 'Milanesa')
  await userEvent.type(screen.getByPlaceholderText('Descripción del producto'), 'Rica milanesa')
  await userEvent.selectOptions(screen.getByLabelText('Categoría'), 'c1')
  await userEvent.type(screen.getByPlaceholderText('0'), '1200')
}

describe('ProductEditPage image and flags', () => {
  it('uploads an image through the form image field', async () => {
    const uploadImage = vi.fn().mockResolvedValue('https://cdn.bosco.test/p.png')
    setup({ uploadImage })

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['img'], 'burger.png', { type: 'image/png' })

    await userEvent.upload(input, file)

    await waitFor(() => expect(uploadImage).toHaveBeenCalledWith(file))
    expect(await screen.findByDisplayValue('https://cdn.bosco.test/p.png')).toBeInTheDocument()
  })

  it('disables submit while the image is uploading', async () => {
    setup({ isUploading: true })

    await fillGeneralForm()

    expect(screen.getByText('Guardar').closest('button')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Seleccionar imagen' })).toBeDisabled()
  })

  it('submits available=false when the switch is off', async () => {
    const save = vi.fn().mockResolvedValue(null)
    setup({ save })

    await fillGeneralForm()
    await userEvent.click(screen.getByLabelText('Producto disponible'))

    const submit = screen.getByRole('button', { name: 'Guardar' })
    await waitFor(() => expect(submit).toBeEnabled())
    await userEvent.click(submit)

    await waitFor(() =>
      expect(save).toHaveBeenCalledWith(expect.objectContaining({ available: false })),
    )
  })

  it('navigates to the edit page when creation returns an id', async () => {
    const save = vi.fn().mockResolvedValue('p2')
    setup({ save })

    await fillGeneralForm()

    const submit = screen.getByRole('button', { name: 'Guardar' })
    await waitFor(() => expect(submit).toBeEnabled())
    await userEvent.click(submit)

    expect(await screen.findByText('Editar producto page')).toBeInTheDocument()
  })

  it('stays on the new page when creation returns null', async () => {
    const save = vi.fn().mockResolvedValue(null)
    setup({ save })

    await fillGeneralForm()

    const submit = screen.getByRole('button', { name: 'Guardar' })
    await waitFor(() => expect(submit).toBeEnabled())
    await userEvent.click(submit)

    await waitFor(() => expect(save).toHaveBeenCalled())
    expect(screen.queryByText('Editar producto page')).not.toBeInTheDocument()
    expect(screen.getByText('Nuevo producto')).toBeInTheDocument()
  })
})
