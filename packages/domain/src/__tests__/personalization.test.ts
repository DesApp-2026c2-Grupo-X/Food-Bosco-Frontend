import { describe, expect, it } from 'vitest'
import type { Category, Product } from '../catalog'
import type { Order, OrderItem } from '../order'
import type { Promotion } from '../promotion'
import {
  buildTasteProfile,
  getReorderSuggestions,
  orderCategoriesByTaste,
  orderPromotionsForUser,
  recommendDiscoveryProducts,
  recommendProducts,
} from '../personalization'

const product = (id: string, categoryId: string, available = true): Product => ({
  id,
  categoryId,
  name: `Producto ${id}`,
  description: 'Rico',
  price: 1000,
  image: null,
  available,
  configGroups: [],
  recipe: [],
})

const item = (productId: string, quantity = 1, name = `Producto ${productId}`): OrderItem => ({
  productId,
  name,
  unitPrice: 1000,
  quantity,
  observations: null,
  subtotal: 1000 * quantity,
  options: [],
})

const order = ({
  id,
  status = 'DELIVERED',
  createdAt = '2026-11-01T12:00:00.000Z',
  branchId = 'b1',
  items = [item('p1')],
}: {
  id: string
  status?: Order['status']
  createdAt?: string
  branchId?: string
  items?: OrderItem[]
}): Order => ({
  id,
  number: id,
  clientId: 'u1',
  branchId,
  deliveryAddress: { text: 'Calle 1', latitude: -34.6, longitude: -58.4 },
  status,
  total: 1000,
  estimatedDeliveryAt: null,
  createdAt,
  items,
  statusHistory: [],
  availableTransitions: [],
})

const promotion = (id: string, overrides: Partial<Promotion> = {}): Promotion => ({
  id,
  name: `Promo ${id}`,
  description: null,
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-12-31T23:59:59.999Z',
  active: true,
  type: 'PERCENTAGE',
  discountValue: 10,
  maxDiscount: null,
  buyQuantity: null,
  payQuantity: null,
  scope: 'ORDER',
  categoryIds: [],
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

const categories: Category[] = [
  { id: 'c1', name: 'Hamburguesas', active: true },
  { id: 'c2', name: 'Bebidas', active: true },
  { id: 'c3', name: 'Postres', active: true },
]

describe('personalization', () => {
  it('builds a taste profile from delivered orders only', () => {
    const products = [product('p1', 'c1'), product('p2', 'c1'), product('p3', 'c2')]
    const profile = buildTasteProfile(
      [
        order({
          id: 'o1',
          createdAt: '2026-11-15T12:00:00.000Z',
          items: [item('p1', 3), item('p3', 1)],
        }),
        order({ id: 'o2', createdAt: '2026-10-01T12:00:00.000Z', items: [item('p2', 1)] }),
        order({ id: 'o3', status: 'CANCELLED', items: [item('p1', 10)] }),
      ],
      products,
      new Date('2026-11-18T12:00:00.000Z'),
    )

    expect(profile.completedOrders).toBe(2)
    expect(profile.lastOrderAt).toBe('2026-11-15T12:00:00.000Z')
    expect(profile.favoriteProductIds[0]).toBe('p1')
    expect(profile.favoriteCategoryIds[0]).toBe('c1')
    expect(profile.favoriteBranchIds[0]).toBe('b1')
  })

  it('returns the catalogue order for users without purchase history', () => {
    const products = Array.from({ length: 10 }, (_, index) =>
      product(`p${index + 1}`, index < 5 ? 'c1' : 'c2'),
    )
    const profile = buildTasteProfile([], products)

    const result = recommendProducts({ products, profile })

    expect(result).toHaveLength(8)
    expect(result[0]?.product.id).toBe('p1')
    expect(result.every((entry) => entry.reason === 'POPULAR')).toBe(true)
  })

  it('prioritizes repeats and keeps category diversity', () => {
    const products = [
      product('p1', 'c1'),
      product('p2', 'c1'),
      product('p3', 'c1'),
      product('p4', 'c1'),
      product('p5', 'c2'),
      product('p6', 'c2'),
      product('p7', 'c3'),
    ]
    const profile = buildTasteProfile(
      [order({ id: 'o1', items: [item('p1', 4), item('p5', 1)] })],
      products,
      new Date('2026-11-18T12:00:00.000Z'),
    )

    const result = recommendProducts({ products, profile, limit: 4 })
    const categoryCounts = result.reduce<Record<string, number>>((counts, entry) => {
      counts[entry.product.categoryId] = (counts[entry.product.categoryId] ?? 0) + 1
      return counts
    }, {})

    expect(result[0]?.product.id).toBe('p1')
    expect(result[0]?.reason).toBe('REPEAT')
    expect(categoryCounts.c1).toBeLessThanOrEqual(2)
    expect(result.length).toBe(4)
  })

  it('excludes unavailable products', () => {
    const products = [product('p1', 'c1', false), product('p2', 'c1')]
    const profile = buildTasteProfile([order({ id: 'o1' })], products)

    const result = recommendProducts({ products, profile })

    expect(result.map((entry) => entry.product.id)).toEqual(['p2'])
  })

  it('recommends unexplored categories for discovery and excludes purchased products', () => {
    const products = [
      product('p1', 'c1'),
      product('p2', 'c1'),
      product('p3', 'c2'),
      product('p4', 'c3'),
    ]
    const profile = buildTasteProfile(
      [order({ id: 'o1', items: [item('p1')] })],
      products,
      new Date('2026-11-18T12:00:00.000Z'),
    )

    const result = recommendDiscoveryProducts({ products, profile, limit: 3 })

    expect(result.map((entry) => entry.product.id)).toEqual(['p3', 'p4', 'p2'])
    expect(result.every((entry) => entry.reason === 'DISCOVERY')).toBe(true)
  })

  it('orders categories by affinity without dropping any', () => {
    const profile = buildTasteProfile(
      [order({ id: 'o1', items: [item('p3')] })],
      [product('p3', 'c3')],
      new Date('2026-11-18T12:00:00.000Z'),
    )

    const result = orderCategoriesByTaste(categories, profile)

    expect(result.map((category) => category.id)).toEqual(['c3', 'c1', 'c2'])
  })

  it('prioritizes promotions that match the user affinity', () => {
    const profile = buildTasteProfile(
      [order({ id: 'o1', items: [item('p1')] })],
      [product('p1', 'c1')],
      new Date('2026-11-18T12:00:00.000Z'),
    )
    const generic = promotion('generic')
    const categoryMatch = promotion('category', { categoryIds: ['c1'] })
    const productMatch = promotion('product', { productIds: ['p1'] })

    const result = orderPromotionsForUser([generic, categoryMatch, productMatch], profile)

    expect(result.map((entry) => entry.id)).toEqual(['product', 'category', 'generic'])
  })

  it('deduplicates repeated orders in the reorder suggestions', () => {
    const orders = [
      order({ id: 'o1', createdAt: '2026-11-15T12:00:00.000Z', items: [item('p1')] }),
      order({ id: 'o2', createdAt: '2026-11-10T12:00:00.000Z', items: [item('p1')] }),
      order({ id: 'o3', createdAt: '2026-11-05T12:00:00.000Z', items: [item('p2')] }),
      order({ id: 'o4', status: 'CANCELLED', items: [item('p3')] }),
    ]

    const result = getReorderSuggestions(orders)

    expect(result.map((entry) => entry.id)).toEqual(['o1', 'o3'])
  })
})
