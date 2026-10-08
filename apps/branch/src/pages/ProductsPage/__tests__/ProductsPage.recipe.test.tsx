import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { BranchProduct } from '@repo/domain'
import { useBranchProducts } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { ProductsPage } from '../index'

vi.mock('@repo/api', () => ({
  useBranchProducts: vi.fn(),
}))

const makeBranchProduct = (): BranchProduct => ({
  product: {
    id: 'p1',
    categoryId: 'c1',
    name: 'Milanesa',
    description: 'Milanesa completa',
    price: 1500,
    image: null,
    available: true,
    configGroups: [],
    recipe: [
      {
        id: 'r1',
        ingredientId: 'i1',
        quantity: 2,
        ingredient: { id: 'i1', name: 'Queso', unit: 'gr', active: true },
      },
    ],
  },
  categoryName: 'Platos',
  available: true,
})

const mockProducts = () => {
  vi.mocked(useBranchProducts).mockReturnValue({
    products: [makeBranchProduct()],
    isLoading: false,
    isToggling: false,
    setAvailability: vi.fn().mockResolvedValue(undefined),
  })
}

describe('ProductsPage recipe modal', () => {
  beforeEach(() => {
    mockProducts()
  })

  it('clears the selection and hides the modal when closed', async () => {
    renderWithProviders(<ProductsPage />)

    await userEvent.click(screen.getByRole('button', { name: /Ver receta/ }))
    expect(await screen.findByRole('heading', { name: 'Receta' })).toBeInTheDocument()
    expect(screen.getByText('Queso')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')

    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Receta' })).not.toBeInTheDocument(),
    )
    expect(screen.queryByText('Queso')).not.toBeInTheDocument()
  })

  it('can reopen the recipe modal after closing it', async () => {
    renderWithProviders(<ProductsPage />)

    await userEvent.click(screen.getByRole('button', { name: /Ver receta/ }))
    await screen.findByRole('heading', { name: 'Receta' })

    await userEvent.keyboard('{Escape}')
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Receta' })).not.toBeInTheDocument(),
    )

    await userEvent.click(screen.getByRole('button', { name: /Ver receta/ }))

    expect(await screen.findByRole('heading', { name: 'Receta' })).toBeInTheDocument()
  })
})
