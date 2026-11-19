import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Product, ProductPromotionPreview } from '@repo/domain'
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

const preview = (overrides: Partial<ProductPromotionPreview> = {}): ProductPromotionPreview => ({
  promotionId: 'pr1',
  name: '20% en burgers',
  kind: 'PERCENTAGE',
  badge: '-20%',
  originalPrice: 1000,
  estimatedUnitPrice: 800,
  discountValue: 20,
  maxDiscount: null,
  minSubtotal: 0,
  minQuantity: 0,
  conditionsMet: true,
  promotionCount: 1,
  endsAt: '2026-11-30T00:00:00.000Z',
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

  it('shows badge, previous price and estimated price for an uncapped percentage', () => {
    renderWithProviders(<ProductCard product={product({ promotion: preview() })} />)

    expect(screen.getByText('-20%')).toBeInTheDocument()
    expect(screen.getByLabelText('Precio anterior')).toHaveTextContent(
      formatPrice(1000).replace(/\s/g, ' '),
    )
    expect(screen.getByText(formatPrice(800).replace(/\s/g, ' '))).toBeInTheDocument()
  })

  it('shows the cap and no estimated price for a capped percentage', () => {
    renderWithProviders(
      <ProductCard
        product={product({
          promotion: preview({ maxDiscount: 100, estimatedUnitPrice: null }),
        })}
      />,
    )

    expect(screen.getByText('-20%')).toBeInTheDocument()
    expect(screen.getByText(/Tope/)).toBeInTheDocument()
    expect(screen.queryByLabelText('Precio anterior')).not.toBeInTheDocument()
  })

  it('shows a fixed amount badge without estimated price', () => {
    renderWithProviders(
      <ProductCard
        product={product({
          promotion: preview({
            kind: 'FIXED_AMOUNT',
            badge: 'Hasta $1.000 OFF',
            estimatedUnitPrice: null,
            discountValue: 1000,
          }),
        })}
      />,
    )

    expect(screen.getByText('Hasta $1.000 OFF')).toBeInTheDocument()
    expect(screen.queryByLabelText('Precio anterior')).not.toBeInTheDocument()
  })

  it('shows the minimum condition when it is not met', () => {
    renderWithProviders(
      <ProductCard
        product={product({
          promotion: preview({
            conditionsMet: false,
            estimatedUnitPrice: null,
            minSubtotal: 5000,
          }),
        })}
      />,
    )

    expect(screen.getByText('Sujeto a compra mínima')).toBeInTheDocument()
  })

  it('hides the promotion when showPromotion is false', () => {
    renderWithProviders(
      <ProductCard product={product({ promotion: preview() })} showPromotion={false} />,
    )

    expect(screen.queryByText('-20%')).not.toBeInTheDocument()
  })
})
