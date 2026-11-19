import { describe, expect, it } from 'vitest'
import { toHomeFeed } from '../home-feed'

const rawProduct = {
  id: 'p1',
  categoryId: 'c1',
  name: 'Burger',
  description: 'Clásica',
  price: 1000,
  image: null,
  available: true,
  configGroups: [],
  recipe: [],
}

const rawBranch = {
  id: 'b1',
  name: 'Centro',
  addressText: 'Calle 1',
  latitude: -34.6,
  longitude: -58.4,
  phone: null,
  active: true,
  hours: [],
}

const rawCategory = { id: 'c1', name: 'Hamburguesas', active: true }

const rawPromotion = {
  id: 'promo-1',
  name: '2x1',
  description: null,
  startDate: '2026-11-01T00:00:00.000Z',
  endDate: '2026-11-30T00:00:00.000Z',
  type: 'BUY_X_GET_Y',
  discountValue: null,
  maxDiscount: null,
  buyQuantity: 2,
  payQuantity: 1,
  scope: 'CATEGORY',
  categoryIds: ['c1'],
  productIds: [],
  branchIds: [],
  minSubtotal: 0,
  minQuantity: 0,
  daysOfWeek: [],
  startTime: null,
  endTime: null,
}

const rawFeed = {
  generatedAt: '2026-11-18T03:00:00.000Z',
  hasHistory: true,
  topCategory: rawCategory,
  favoriteBranch: rawBranch,
  nearestBranch: { branch: rawBranch, distanceMeters: 820 },
  categories: [rawCategory],
  forYou: [{ product: rawProduct, reason: 'REPEAT', hint: 'Ya lo pediste', score: 5.25 }],
  discovery: [{ product: rawProduct, reason: 'DISCOVERY', hint: 'Nuevo para vos', score: 0.8 }],
  reorder: [
    {
      id: 'o1',
      number: '102',
      status: 'DELIVERED',
      createdAt: '2026-11-10T10:00:00.000Z',
      total: 2100,
      branchId: 'b1',
      branch: rawBranch,
      items: [{ productId: 'p1', name: 'Burger', quantity: 2 }],
    },
  ],
  promotions: [rawPromotion],
}

describe('toHomeFeed', () => {
  it('mapea el feed completo a tipos de dominio', () => {
    const feed = toHomeFeed(rawFeed)

    expect(feed.hasHistory).toBe(true)
    expect(feed.topCategory?.name).toBe('Hamburguesas')
    expect(feed.favoriteBranch?.name).toBe('Centro')
    expect(feed.nearestBranch).toEqual({
      branch: expect.objectContaining({ id: 'b1' }),
      distanceMeters: 820,
    })
    expect(feed.forYou[0]).toMatchObject({ reason: 'REPEAT', hint: 'Ya lo pediste', score: 5.25 })
    expect(feed.forYou[0].product.name).toBe('Burger')
    expect(feed.discovery[0].reason).toBe('DISCOVERY')
    expect(feed.reorder[0]).toMatchObject({
      id: 'o1',
      number: '102',
      status: 'DELIVERED',
      total: 2100,
      branch: expect.objectContaining({ id: 'b1' }),
    })
    expect(feed.reorder[0].items).toEqual([{ productId: 'p1', name: 'Burger', quantity: 2 }])
  })

  it('marca las promociones del feed como activas y sin campos administrativos', () => {
    const feed = toHomeFeed(rawFeed)
    const promotion = feed.promotions[0]

    expect(promotion.active).toBe(true)
    expect(promotion.type).toBe('BUY_X_GET_Y')
    expect(promotion.scope).toBe('CATEGORY')
    expect(promotion.code).toBeNull()
    expect(promotion.usedCount).toBe(0)
  })

  it('tolera secciones nulas o vacías', () => {
    const feed = toHomeFeed({
      generatedAt: '2026-11-18T03:00:00.000Z',
      hasHistory: false,
      topCategory: null,
      favoriteBranch: null,
      nearestBranch: null,
      categories: [],
      forYou: [],
      discovery: [],
      reorder: [],
      promotions: [],
    })

    expect(feed.topCategory).toBeNull()
    expect(feed.favoriteBranch).toBeNull()
    expect(feed.nearestBranch).toBeNull()
    expect(feed.forYou).toEqual([])
    expect(feed.reorder).toEqual([])
  })
})
