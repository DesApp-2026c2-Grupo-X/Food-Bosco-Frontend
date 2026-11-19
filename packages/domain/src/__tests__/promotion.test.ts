import { describe, expect, it } from 'vitest'
import {
  describePromotion,
  formatDiscount,
  getPromotionCategoryId,
  isPromotionActive,
  type Promotion,
} from '../promotion'

describe('promotion helpers', () => {
  it('describe promociones porcentuales con y sin tope', () => {
    expect(describePromotion({ type: 'PERCENTAGE', discountValue: 20 })).toBe('20% de descuento')
    expect(
      describePromotion({ type: 'PERCENTAGE', discountValue: 15, maxDiscount: 2000 }),
    ).toContain('tope $')
  })

  it('describe promociones de monto fijo', () => {
    expect(describePromotion({ type: 'FIXED_AMOUNT', discountValue: 1500 })).toContain(
      '$1.500 de descuento',
    )
  })

  it('describe promociones NxM (BUY_X_GET_Y)', () => {
    expect(describePromotion({ type: 'BUY_X_GET_Y', buyQuantity: 2, payQuantity: 1 })).toBe('2x1')
    expect(describePromotion({ type: 'BUY_X_GET_Y', buyQuantity: 3, payQuantity: 2 })).toBe('3x2')
  })

  it('describe promociones informativas', () => {
    expect(describePromotion({})).toBe('Promoción informativa')
    expect(describePromotion({ type: null })).toBe('Promoción informativa')
  })

  it('formatea montos de descuento con signo negativo', () => {
    expect(formatDiscount(0)).toBe('$0')
    expect(formatDiscount(500)).toContain('-$')
  })

  it('resuelve la categoría de una promoción por categoría o por producto', () => {
    const products = [
      { id: 'p1', categoryId: 'cat-burgers' },
      { id: 'p2', categoryId: 'cat-drinks' },
    ]

    expect(
      getPromotionCategoryId({ categoryIds: ['cat-pizzas'], productIds: [] }, products),
    ).toBe('cat-pizzas')
    expect(
      getPromotionCategoryId({ categoryIds: [], productIds: ['p2'] }, products),
    ).toBe('cat-drinks')
    expect(
      getPromotionCategoryId({ categoryIds: [], productIds: ['missing'] }, products),
    ).toBeNull()
    expect(getPromotionCategoryId({ categoryIds: [], productIds: [] }, products)).toBeNull()
  })

  it('evalúa isPromotionActive según active y fechas', () => {
    const promo: Promotion = {
      id: 'p1',
      name: 'Promo',
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
    }

    expect(isPromotionActive(promo, new Date('2026-06-01T00:00:00.000Z'))).toBe(true)
    expect(
      isPromotionActive({ ...promo, active: false }, new Date('2026-06-01T00:00:00.000Z')),
    ).toBe(false)
    expect(isPromotionActive(promo, new Date('2025-01-01T00:00:00.000Z'))).toBe(false)
    expect(isPromotionActive(promo, new Date('2027-01-01T00:00:00.000Z'))).toBe(false)
  })
})
