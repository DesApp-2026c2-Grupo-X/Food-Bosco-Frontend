import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { BranchProduct, Product } from '@repo/domain'
import { useBranchProducts } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { ProductsPage } from '../index'

vi.mock('@repo/api', () => ({
  useBranchProducts: vi.fn(),
}))

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'p1',
  categoryId: 'c1',
  name: 'Milanesa',
  description: 'Milanesa completa',
  price: 1500,
  image: null,
  available: true,
  configGroups: [],
  recipe: [],
  ...overrides,
})

const makeBranchProduct = (overrides: Partial<BranchProduct> = {}): BranchProduct => ({
  product: makeProduct(),
  categoryName: 'Platos',
  available: true,
  ...overrides,
})

const mockProducts = (
  products: BranchProduct[],
  extra: Partial<ReturnType<typeof useBranchProducts>> = {},
) => {
  vi.mocked(useBranchProducts).mockReturnValue({
    products,
    isLoading: false,
    isToggling: false,
    setAvailability: vi.fn().mockResolvedValue(undefined),
    ...extra,
  })
}

describe('ProductsPage', () => {
  beforeEach(() => {
    mockProducts([makeBranchProduct()])
  })

  it('renders the products with category, price and availability', () => {
    renderWithProviders(<ProductsPage />)

    expect(screen.getByText('Milanesa')).toBeInTheDocument()
    expect(screen.getByText('Platos')).toBeInTheDocument()
    expect(screen.getByText(/1\.500/)).toBeInTheDocument()
    expect(screen.getByLabelText('Disponibilidad de Milanesa')).toHaveAttribute(
      'data-state',
      'checked',
    )
  })

  it('shows the empty state when there are no products', () => {
    mockProducts([])
    renderWithProviders(<ProductsPage />)

    expect(screen.getByText('Sin productos')).toBeInTheDocument()
  })

  it('pauses a product by calling setAvailability on toggle', async () => {
    const setAvailability = vi.fn().mockResolvedValue(undefined)
    mockProducts([makeBranchProduct({ available: true })], { setAvailability })
    renderWithProviders(<ProductsPage />)

    await userEvent.click(screen.getByLabelText('Disponibilidad de Milanesa'))

    expect(setAvailability).toHaveBeenCalledWith('p1', false)
  })

  it('reactivates a paused product by calling setAvailability', async () => {
    const setAvailability = vi.fn().mockResolvedValue(undefined)
    mockProducts([makeBranchProduct({ available: false })], { setAvailability })
    renderWithProviders(<ProductsPage />)

    expect(screen.getByLabelText('Disponibilidad de Milanesa')).toHaveAttribute(
      'data-state',
      'unchecked',
    )

    await userEvent.click(screen.getByLabelText('Disponibilidad de Milanesa'))

    expect(setAvailability).toHaveBeenCalledWith('p1', true)
  })

  it('disables the availability toggle while a toggle is in flight', () => {
    mockProducts([makeBranchProduct()], { isToggling: true })
    renderWithProviders(<ProductsPage />)

    expect(screen.getByLabelText('Disponibilidad de Milanesa')).toHaveAttribute('data-disabled')
  })

  it('opens the recipe modal with the product recipe', async () => {
    mockProducts([
      makeBranchProduct({
        product: makeProduct({
          recipe: [
            {
              id: 'r1',
              ingredientId: 'i1',
              quantity: 2,
              ingredient: { id: 'i1', name: 'Queso', unit: 'gr', active: true },
            },
          ],
        }),
      }),
    ])
    renderWithProviders(<ProductsPage />)

    await userEvent.click(screen.getByRole('button', { name: /Ver receta/ }))

    expect(await screen.findByRole('heading', { name: 'Receta' })).toBeInTheDocument()
    expect(screen.getByText('Queso')).toBeInTheDocument()
    expect(screen.getByText('2 gr')).toBeInTheDocument()
  })
})
