import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@repo/api'
import type { User } from '@repo/domain'
import { HomePage } from '../index'
import { useAddressStore } from '../../../stores/addressStore'
import { useRecentViewsStore } from '../../../stores/recentViewsStore'
import { createTestClient, type TestApolloClient } from '@test/apollo'
import { renderWithProviders } from '@test/utils'

const user: User = {
  id: 'u1',
  email: 'ana@bosco.com',
  role: 'customer',
  firstName: 'Ana',
  lastName: 'Pérez',
  phone: '+54 11 5555-1234',
  active: true,
  createdAt: '2025-01-01T10:00:00Z',
}

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

const rawBranch = {
  id: 'b1',
  name: 'Centro',
  addressText: 'Av. Central 100',
  latitude: -34.6,
  longitude: -58.4,
  phone: null,
  active: true,
  hours: [],
}

const rawProduct = (index: number, categoryId = 'c1') => ({
  id: `p${index}`,
  categoryId,
  name: `Producto ${index}`,
  description: 'Rico',
  price: 1000 + index,
  image: null,
  available: true,
  configGroups: [],
  recipe: [],
  promotion: null,
  promotions: [],
})

const categories = [
  { id: 'c1', name: 'Comida', active: true },
  { id: 'c2', name: 'Bebidas', active: true },
]

const activeOrder = {
  id: 'o1',
  number: '101',
  clientId: 'c1',
  branchId: 'b1',
  branch: null,
  riderId: null,
  rider: null,
  client: null,
  deliveryAddress: { text: 'Calle 1', latitude: -34.6, longitude: -58.4 },
  status: 'PREPARING',
  total: 2300,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T10:00:00Z',
  items: [],
  statusHistory: [],
  availableTransitions: [],
}

const deliveredOrder = {
  id: 'o2',
  number: '102',
  clientId: 'u1',
  branchId: 'b1',
  branch: rawBranch,
  riderId: null,
  rider: null,
  client: null,
  deliveryAddress: { text: 'Calle 1', latitude: -34.6, longitude: -58.4 },
  status: 'DELIVERED',
  total: 2100,
  subtotal: 2100,
  discountTotal: 0,
  promotionCode: null,
  appliedPromotions: [],
  estimatedDeliveryAt: null,
  createdAt: '2026-11-10T10:00:00Z',
  items: [
    {
      productId: 'p1',
      name: 'Producto 1',
      unitPrice: 1000,
      quantity: 1,
      observations: null,
      subtotal: 1000,
      options: [],
    },
    {
      productId: 'p2',
      name: 'Producto 2',
      unitPrice: 1100,
      quantity: 1,
      observations: null,
      subtotal: 1100,
      options: [],
    },
  ],
  statusHistory: [],
  availableTransitions: [],
}

const rawPromotion = (overrides: Record<string, unknown> = {}) => ({
  id: 'promo-1',
  name: '2x1 en bebidas',
  description: null,
  startDate: '2026-11-01T00:00:00.000Z',
  endDate: '2026-11-30T00:00:00.000Z',
  active: true,
  type: 'BUY_X_GET_Y',
  discountValue: null,
  maxDiscount: null,
  buyQuantity: 2,
  payQuantity: 1,
  scope: 'CATEGORY',
  categoryIds: ['c2'],
  productIds: [],
  branchIds: [],
  minSubtotal: 0,
  minQuantity: 0,
  daysOfWeek: [],
  startTime: null,
  endTime: null,
  code: null,
  stackable: false,
  priority: 0,
  maxUsesTotal: null,
  maxUsesPerCustomer: null,
  usedCount: 0,
  ...overrides,
})

const rawPromotionPreview = {
  promotionId: 'product-promo',
  name: '2x1 en Producto 1',
  kind: 'BUY_X_GET_Y',
  badge: '2x1',
  originalPrice: 1001,
  estimatedUnitPrice: null,
  discountValue: null,
  maxDiscount: null,
  minSubtotal: 0,
  minQuantity: 0,
  conditionsMet: true,
  promotionCount: 1,
  endsAt: '2026-11-30T00:00:00.000Z',
}

const remoteFeed = {
  generatedAt: '2026-11-18T03:00:00.000Z',
  hasHistory: true,
  topCategory: categories[0],
  favoriteBranch: rawBranch,
  nearestBranch: { branch: rawBranch, distanceMeters: 820 },
  categories,
  forYou: [{ product: rawProduct(1), reason: 'REPEAT', hint: 'Ya lo pediste', score: 5.25 }],
  discovery: [{ product: rawProduct(2), reason: 'DISCOVERY', hint: 'Nuevo para vos', score: 1 }],
  reorder: [
    {
      id: 'o2',
      number: '102',
      status: 'DELIVERED',
      createdAt: '2026-11-10T10:00:00Z',
      total: 2100,
      branchId: 'b1',
      branch: rawBranch,
      items: [{ productId: 'p1', name: 'Producto 1', quantity: 2 }],
    },
  ],
  promotions: [],
}

const buildClient = ({
  branches = [rawBranch],
  products = Array.from({ length: 9 }, (_, index) => rawProduct(index + 1)),
  orders = [] as unknown[],
  categoryList = categories,
  promotions = [] as unknown[],
  homeFeed,
}: {
  branches?: unknown[]
  products?: unknown[]
  orders?: unknown[]
  categoryList?: unknown[]
  promotions?: unknown[]
  homeFeed?: unknown
} = {}): TestApolloClient =>
  createTestClient((operation) => {
    switch (operation.operationName) {
      case 'MyAddresses':
        return { data: { myAddresses: [rawAddress] } }
      case 'AvailableBranches':
        return { data: { availableBranches: branches } }
      case 'Categories':
        return { data: { categories: categoryList } }
      case 'Products':
        return { data: { products } }
      case 'MyOrders':
        return { data: { myOrders: orders } }
      case 'PublicPromotions':
        return { data: { publicPromotions: promotions } }
      case 'HomeFeed':
        return homeFeed instanceof Error ? homeFeed : { data: { homeFeed } }
      default:
        return { data: {} }
    }
  })

const CatalogProbe = () => {
  const { search } = useLocation()
  return <div data-testid="catalog-route">{search}</div>
}

const renderHome = (client: TestApolloClient, route = '/') =>
  renderWithProviders(
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/catalog" element={<CatalogProbe />} />
    </Routes>,
    { client: client.client, route },
  )

describe('HomePage', () => {
  beforeEach(() => {
    useAddressStore.setState({ selectedAddressId: 'a1' })
    useAuthStore.setState({ user, accessToken: null })
    useRecentViewsStore.setState({ viewsByUser: {} })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('greets the user and shows a catalog preview when a branch is available', async () => {
    renderHome(buildClient())

    expect(await screen.findByText('¡Hola, Ana!')).toBeInTheDocument()
    expect(await screen.findByText('Explorá por categoría')).toBeInTheDocument()
    expect(screen.getByText('Los más pedidos')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Comida' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bebidas' })).toBeInTheDocument()
    expect(screen.getByText('Producto 1')).toBeInTheDocument()
    expect(screen.getByText('Producto 8')).toBeInTheDocument()
    expect(screen.queryByText('Producto 9')).not.toBeInTheDocument()
  })

  it('navigates to the catalog filtered by the chosen category', async () => {
    renderHome(buildClient())
    await screen.findByText('Explorá por categoría')

    await userEvent.click(screen.getByRole('button', { name: 'Comida' }))

    expect(await screen.findByTestId('catalog-route')).toHaveTextContent('?cat=c1')
  })

  it('navigates to the for-you category from the category carousel', async () => {
    renderHome(buildClient({ orders: [deliveredOrder] }))
    await screen.findByText('Explorá por categoría')

    await userEvent.click(screen.getByRole('button', { name: 'Para vos' }))

    expect(await screen.findByTestId('catalog-route')).toHaveTextContent('?cat=for-you')
  })

  it('navigates to the for-you catalog from the Para vos section', async () => {
    renderHome(buildClient({ orders: [deliveredOrder] }))
    await screen.findByRole('heading', { name: 'Para vos' })

    await userEvent.click(screen.getByRole('link', { name: 'Ver todo el catálogo' }))

    expect(await screen.findByTestId('catalog-route')).toHaveTextContent('?cat=for-you')
  })

  it('does not render the catalog preview without an available branch', async () => {
    renderHome(buildClient({ branches: [] }))

    expect(await screen.findByText('¡Hola, Ana!')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('Explorá por categoría')).not.toBeInTheDocument())
    expect(screen.queryByText('Los más pedidos')).not.toBeInTheDocument()
  })

  it('falls back to the generic hero title when the user has no name', async () => {
    useAuthStore.setState({ user: null, accessToken: null })

    renderHome(buildClient())

    expect(await screen.findByText('¿Qué tenés ganas de comer hoy?')).toBeInTheDocument()
    expect(screen.queryByText(/¡Hola,/)).not.toBeInTheDocument()
  })

  it('lists the orders in progress', async () => {
    renderHome(buildClient({ orders: [activeOrder] }))

    expect(await screen.findByText('Pedidos en curso')).toBeInTheDocument()
    expect(screen.getByText('Pedido #101')).toBeInTheDocument()
  })

  it('exposes the main calls to action', async () => {
    renderHome(buildClient())
    await screen.findByText('¡Hola, Ana!')

    expect(screen.getByRole('link', { name: 'Pedir ahora' })).toHaveAttribute('href', '/catalog')
    expect(screen.getByRole('link', { name: 'Ver sucursales' })).toHaveAttribute(
      'href',
      '/branches',
    )
    expect(screen.getByRole('link', { name: 'Conocer sucursales' })).toHaveAttribute(
      'href',
      '/branches',
    )
    expect(screen.getByRole('link', { name: 'Ver todo' })).toHaveAttribute('href', '/catalog')
    expect(screen.getByRole('link', { name: 'Ver todo el catálogo' })).toHaveAttribute(
      'href',
      '/catalog',
    )
  })

  it('keeps the generic catalogue experience for a new user', async () => {
    renderHome(buildClient())

    expect(await screen.findByText('Los más pedidos')).toBeInTheDocument()
    expect(screen.queryByText('Volvé a pedir')).not.toBeInTheDocument()
    expect(screen.queryByText('Para vos')).not.toBeInTheDocument()
  })

  it('shows reorder suggestions and personalised products for a returning user', async () => {
    renderHome(buildClient({ orders: [deliveredOrder] }))

    expect(await screen.findByText('Volvé a pedir')).toBeInTheDocument()
    expect(screen.getByText('Pedido #102')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Para vos' })).toBeInTheDocument()
    expect(screen.getAllByText('Ya lo pediste').length).toBeGreaterThan(0)
    expect(screen.queryByText('Los más pedidos')).not.toBeInTheDocument()
  })

  it('shows discovery products from categories the user has not explored', async () => {
    const expandedCategories = [
      ...categories,
      { id: 'c3', name: 'Postres', active: true },
      { id: 'c4', name: 'Ensaladas', active: true },
    ]
    const expandedProducts = [
      ...Array.from({ length: 9 }, (_, index) => rawProduct(index + 1, 'c1')),
      ...Array.from({ length: 3 }, (_, index) => rawProduct(10 + index, 'c2')),
      ...Array.from({ length: 3 }, (_, index) => rawProduct(13 + index, 'c3')),
      ...Array.from({ length: 3 }, (_, index) => rawProduct(16 + index, 'c4')),
    ]

    renderHome(
      buildClient({
        orders: [deliveredOrder],
        products: expandedProducts,
        categoryList: expandedCategories,
      }),
    )

    expect(await screen.findByText('Para probar')).toBeInTheDocument()
    expect(screen.getByText('Producto 16')).toBeInTheDocument()
  })

  it('shows recently viewed products for a user without purchase history', async () => {
    useRecentViewsStore.setState({
      viewsByUser: { u1: [{ productId: 'p3', viewedAt: '2026-11-18T10:00:00.000Z' }] },
    })

    renderHome(buildClient())

    expect(await screen.findByText('Vistos hace poco')).toBeInTheDocument()
    expect(screen.getByText('Lo estás mirando')).toBeInTheDocument()
    expect(screen.getByText('Los más pedidos')).toBeInTheDocument()
  })

  it('links the promotion CTA to the category affected by the promotion', async () => {
    renderHome(
      buildClient({
        orders: [deliveredOrder],
        promotions: [rawPromotion({ categoryIds: ['c2'], productIds: [] })],
      }),
    )

    expect(await screen.findByText('Cupones para vos')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver en el menú' })).toHaveAttribute(
      'href',
      '/catalog?cat=c2',
    )
  })

  it('shows product promotions in their own section', async () => {
    renderHome(
      buildClient({
        orders: [deliveredOrder],
        products: [
          { ...rawProduct(1), promotion: rawPromotionPreview },
          ...Array.from({ length: 8 }, (_, index) => rawProduct(index + 2)),
        ],
        promotions: [
          rawPromotion({ id: 'coupon-1', name: '20% en bebidas', categoryIds: ['c2'] }),
          rawPromotion({
            id: 'product-promo',
            name: '2x1 en Producto 1',
            scope: 'PRODUCT',
            categoryIds: [],
            productIds: ['p1'],
          }),
        ],
      }),
    )

    expect(await screen.findByText('Productos en promoción')).toBeInTheDocument()
    expect(screen.getByText('Cupones para vos')).toBeInTheDocument()
    expect(screen.getAllByText('2x1 en Producto 1').length).toBeGreaterThan(0)
    expect(screen.getByText('20% en bebidas')).toBeInTheDocument()
  })

  it('uses the server home feed when the feature flag is enabled', async () => {
    vi.stubEnv('VITE_HOME_FEED', 'true')

    renderHome(buildClient({ homeFeed: remoteFeed }))

    expect(await screen.findByText('Volvé a pedir')).toBeInTheDocument()
    expect(screen.getByText('Pedido #102')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Para vos' })).toBeInTheDocument()
    expect(screen.getByText('Para probar')).toBeInTheDocument()
    expect(screen.queryByText('Los más pedidos')).not.toBeInTheDocument()
  })

  it('falls back to the local calculation when the server feed fails', async () => {
    vi.stubEnv('VITE_HOME_FEED', 'true')

    renderHome(
      buildClient({
        orders: [deliveredOrder],
        homeFeed: new Error('feed no disponible'),
      }),
    )

    expect(await screen.findByText('Volvé a pedir')).toBeInTheDocument()
    expect(screen.getByText('Pedido #102')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Para vos' })).toBeInTheDocument()
  })
})
