import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Product } from '@repo/domain'
import { formatPrice } from '@repo/domain'
import { ProductCard } from '../index'
import { renderWithProviders } from '@test/utils'

const product = (overrides: Partial<Product> = {}): Product => ({
  id: 'p1',
  categoryId: 'c1',
  name: 'Burger',
  description: 'Rica',
  price: 1000,
  image: null,
  available: true,
  configGroups: [],
  recipe: [],
  ...overrides,
})

describe('ProductCard', () => {
  it('renders the image when the product has one', () => {
    renderWithProviders(<ProductCard product={product({ image: 'https://img.test/burger.jpg' })} />)

    expect(screen.getByRole('img', { name: 'Burger' })).toHaveAttribute(
      'src',
      'https://img.test/burger.jpg',
    )
  })

  it('omits the image when the product has none', () => {
    renderWithProviders(<ProductCard product={product()} />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('shows the name, description and formatted price', () => {
    renderWithProviders(<ProductCard product={product()} />)

    expect(screen.getByText('Burger')).toBeInTheDocument()
    expect(screen.getByText('Rica')).toBeInTheDocument()
    expect(screen.getByText(formatPrice(1000).replace(/\s/g, ' '))).toBeInTheDocument()
  })

  it('links the card to the product detail page', () => {
    renderWithProviders(<ProductCard product={product()} />)

    expect(screen.getByRole('link', { name: 'Burger' })).toHaveAttribute('href', '/products/p1')
  })

  it('exposes the add button with an accessible label', () => {
    renderWithProviders(<ProductCard product={product()} />)

    expect(screen.getByRole('link', { name: 'Ver Burger' })).toHaveAttribute('href', '/products/p1')
  })
})
