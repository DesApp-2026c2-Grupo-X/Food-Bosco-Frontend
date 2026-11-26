import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@repo/api'
import { PromotionsPage } from '../index'
import { useAddressStore } from '../../../stores/addressStore'
import { createTestClient, type TestApolloClient } from '@test/apollo'
import { renderWithProviders } from '@test/utils'

const rawAddress = {
  id: 'a1',
  label: 'Casa',
  text: 'Calle 1',
  city: 'CABA',
  postalCode: '1425',
  latitude: -34.6,
  longitude: -58.4,
  active: true,
}

const rawProduct = {
  id: 'p1',
  categoryId: 'c1',
  name: 'Producto 1',
  description: 'Rico',
  price: 1000,
  image: null,
  available: true,
  configGroups: [],
  recipe: [],
  promotion: {
    promotionId: 'promo-product',
    name: '20% en Producto 1',
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
  },
  promotions: [],
}

const catalogItem = (overrides: Record<string, unknown> = {}) => ({
  id: 'promo-1',
  name: '20% en bebidas',
  description: 'Válido en el local',
  type: 'PERCENTAGE',
  scope: 'CATEGORY',
  kind: 'PERCENTAGE',
  badge: '-20%',
  discountValue: 20,
  maxDiscount: null,
  buyQuantity: null,
  payQuantity: null,
  startDate: '2026-11-01T00:00:00.000Z',
  endDate: '2026-11-30T00:00:00.000Z',
  daysOfWeek: [],
  startTime: null,
  endTime: null,
  minSubtotal: 0,
  minQuantity: 0,
  branchIds: [],
  code: 'BEBIDAS20',
  categoryIds: ['c1'],
  productIds: [],
  categories: [{ id: 'c1', name: 'Bebidas', active: true }],
  products: [],
  ...overrides,
})

const productPromotion = () =>
  catalogItem({
    id: 'promo-product',
    name: '20% en Producto 1',
    scope: 'PRODUCT',
    categoryIds: [],
    productIds: ['p1'],
    categories: [],
    products: [rawProduct],
    code: null,
  })

const buildClient = (promotionCatalog: unknown[]): TestApolloClient =>
  createTestClient((operation) => {
    if (operation.operationName === 'MyAddresses') {
      return { data: { myAddresses: [rawAddress] } }
    }
    if (operation.operationName === 'PromotionCatalog') {
      return { data: { promotionCatalog } }
    }
    return { data: {} }
  })

const renderPage = (client: TestApolloClient) =>
  renderWithProviders(<PromotionsPage />, { client: client.client, route: '/promotions' })

describe('PromotionsPage', () => {
  beforeEach(() => {
    useAddressStore.setState({ selectedAddressId: 'a1' })
    useAuthStore.setState({
      user: {
        id: 'u1',
        email: 'ana@bosco.com',
        role: 'customer',
        firstName: 'Ana',
        lastName: 'Pérez',
        phone: null,
        active: true,
        createdAt: '2025-01-01T10:00:00Z',
      },
      accessToken: null,
    })
  })

  it('shows coupons and products with their CTA', async () => {
    renderPage(buildClient([catalogItem(), productPromotion()]))

    expect(await screen.findByText('Cupones y beneficios')).toBeInTheDocument()
    expect(screen.getByText('Productos en promoción')).toBeInTheDocument()
    expect(screen.getByText('20% en bebidas')).toBeInTheDocument()
    expect(screen.getByText('BEBIDAS20')).toBeInTheDocument()
    expect(screen.getByText('Producto 1')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver en el menú' })).toHaveAttribute(
      'href',
      '/catalog?cat=c1',
    )
  })

  it('shows an empty state when there are no promotions', async () => {
    renderPage(buildClient([]))

    expect(await screen.findByText('Promociones')).toBeInTheDocument()
    expect(await screen.findByText('No hay promociones vigentes')).toBeInTheDocument()
  })
})
