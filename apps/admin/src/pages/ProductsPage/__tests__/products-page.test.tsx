import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { Product } from '@repo/domain'
import { useAdminCategories, useAdminProducts } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { ProductsPage } from '../index'

vi.mock('@repo/api', () => ({ useAdminProducts: vi.fn(), useAdminCategories: vi.fn() }))

const product: Product = {
  id: 'p1',
  categoryId: 'c1',
  name: 'Hamburguesa Clásica',
  description: 'Rica',
  price: 1500,
  image: null,
  available: true,
  configGroups: [],
  recipe: [],
}

const mockProducts = (overrides: Partial<ReturnType<typeof useAdminProducts>> = {}) =>
  vi.mocked(useAdminProducts).mockReturnValue({
    products: [{ product, categoryName: 'Hamburguesas' }],
    isLoading: false,
    isToggling: false,
    setAvailable: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useAdminProducts>)

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

describe('ProductsPage', () => {
  it('renders the product list', () => {
    mockProducts()
    mockCategories()

    renderWithProviders(<ProductsPage />)

    expect(screen.getByText('Hamburguesa Clásica')).toBeInTheDocument()
    expect(screen.getAllByText('Hamburguesas').length).toBeGreaterThan(0)
    expect(screen.getByText(/1\.500/)).toBeInTheDocument()
  })

  it('shows the empty state', () => {
    mockProducts({ products: [] })
    mockCategories()

    renderWithProviders(<ProductsPage />)

    expect(screen.getByText('Sin productos')).toBeInTheDocument()
  })

  it('navigates to create a product', async () => {
    mockProducts()
    mockCategories()

    renderWithProviders(
      <Routes>
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/new" element={<div>Nuevo producto page</div>} />
      </Routes>,
      { route: '/products' },
    )

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo producto' }))

    expect(await screen.findByText('Nuevo producto page')).toBeInTheDocument()
  })

  it('navigates to edit a product', async () => {
    mockProducts()
    mockCategories()

    renderWithProviders(
      <Routes>
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:productId/edit" element={<div>Editar producto page</div>} />
      </Routes>,
      { route: '/products' },
    )

    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))

    expect(await screen.findByText('Editar producto page')).toBeInTheDocument()
  })

  it('toggles the availability of a product', async () => {
    const setAvailable = vi.fn()
    mockProducts({ setAvailable })
    mockCategories()

    renderWithProviders(<ProductsPage />)

    await userEvent.click(screen.getByLabelText('Disponibilidad de Hamburguesa Clásica'))

    expect(setAvailable).toHaveBeenCalledWith('p1', false)
  })
})
