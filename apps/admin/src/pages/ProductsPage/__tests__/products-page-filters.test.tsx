import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Product } from '@repo/domain'
import { useAdminCategories, useAdminProducts } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { ProductsPage } from '../index'

vi.mock('@repo/api', () => ({ useAdminProducts: vi.fn(), useAdminCategories: vi.fn() }))

const base = { description: '', price: 1500, image: null, configGroups: [], recipe: [] }

const hamburguesa: Product = {
  ...base,
  id: 'p1',
  categoryId: 'c1',
  name: 'Hamburguesa Clásica',
  available: true,
}

const pizza: Product = { ...base, id: 'p2', categoryId: 'c2', name: 'Pizza', available: false }

const papas: Product = { ...base, id: 'p3', categoryId: 'c1', name: 'Papas', available: false }

const row = (product: Product, categoryName: string) => ({ product, categoryName })

const mockProducts = (overrides: Partial<ReturnType<typeof useAdminProducts>> = {}) =>
  vi.mocked(useAdminProducts).mockReturnValue({
    products: [row(hamburguesa, 'Hamburguesas'), row(pizza, 'Pizzas'), row(papas, 'Hamburguesas')],
    isLoading: false,
    isToggling: false,
    setAvailable: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useAdminProducts>)

const mockCategories = () =>
  vi.mocked(useAdminCategories).mockReturnValue({
    categories: [
      { id: 'c1', name: 'Hamburguesas', active: true },
      { id: 'c2', name: 'Pizzas', active: true },
    ],
    isLoading: false,
    isMutating: false,
    create: vi.fn(),
    update: vi.fn(),
    toggle: vi.fn(),
    remove: vi.fn(),
  } as ReturnType<typeof useAdminCategories>)

const comboboxes = () => screen.getAllByRole('combobox')

describe('ProductsPage filters', () => {
  it('filters by category', async () => {
    mockProducts()
    mockCategories()
    renderWithProviders(<ProductsPage />)

    await userEvent.selectOptions(comboboxes()[0], 'c1')

    expect(screen.getByText('Hamburguesa Clásica')).toBeInTheDocument()
    expect(screen.getByText('Papas')).toBeInTheDocument()
    expect(screen.queryByText('Pizza')).not.toBeInTheDocument()
  })

  it('filters by availability', async () => {
    mockProducts()
    mockCategories()
    renderWithProviders(<ProductsPage />)

    await userEvent.selectOptions(comboboxes()[1], 'unavailable')

    expect(screen.getByText('Pizza')).toBeInTheDocument()
    expect(screen.getByText('Papas')).toBeInTheDocument()
    expect(screen.queryByText('Hamburguesa Clásica')).not.toBeInTheDocument()
  })

  it('combines category and availability filters', async () => {
    mockProducts()
    mockCategories()
    renderWithProviders(<ProductsPage />)

    await userEvent.selectOptions(comboboxes()[0], 'c1')
    await userEvent.selectOptions(comboboxes()[1], 'available')

    expect(screen.getByText('Hamburguesa Clásica')).toBeInTheDocument()
    expect(screen.queryByText('Papas')).not.toBeInTheDocument()
    expect(screen.queryByText('Pizza')).not.toBeInTheDocument()
  })

  it('shows the Sin categoría fallback', () => {
    const orphan: Product = { ...base, id: 'p9', categoryId: 'c9', name: 'Suelto', available: true }
    mockProducts({ products: [row(orphan, 'Sin categoría')] })
    mockCategories()
    renderWithProviders(<ProductsPage />)

    expect(screen.getByText('Sin categoría')).toBeInTheDocument()
  })

  it('shows the loading state', () => {
    mockProducts({ isLoading: true })
    mockCategories()
    const { container } = renderWithProviders(<ProductsPage />)

    expect(container.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
    expect(screen.queryByText('Hamburguesa Clásica')).not.toBeInTheDocument()
  })

  it('disables the availability toggles while toggling', () => {
    mockProducts({ isToggling: true })
    mockCategories()
    renderWithProviders(<ProductsPage />)

    const toggle = screen.getByLabelText(
      'Disponibilidad de Hamburguesa Clásica',
    ) as HTMLLabelElement
    expect(toggle.control).toBeDisabled()
  })
})
