import { describe, expect, it } from 'vitest'
import {
  daysUntilPromotionEnds,
  describePromotion,
  formatDiscount,
  getPromotionCategoryId,
  hasEstimatedPrice,
  isPromotionActive,
  promotionBadgeAriaLabel,
  promotionConditionLabels,
  promotionValidityLabel,
  splitPromotions,
  type ProductPromotionPreview,
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

    expect(getPromotionCategoryId({ categoryIds: ['cat-pizzas'], productIds: [] }, products)).toBe(
      'cat-pizzas',
    )
    expect(getPromotionCategoryId({ categoryIds: [], productIds: ['p2'] }, products)).toBe(
      'cat-drinks',
    )
    expect(
      getPromotionCategoryId({ categoryIds: [], productIds: ['missing'] }, products),
    ).toBeNull()
    expect(getPromotionCategoryId({ categoryIds: [], productIds: [] }, products)).toBeNull()
  })

  it('separa cupones de promociones de producto', () => {
    const base: Promotion = {
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

    const result = splitPromotions([
      base,
      { ...base, id: 'p2', scope: 'CATEGORY', categoryIds: ['cat-1'] },
      { ...base, id: 'p3', scope: 'PRODUCT', productIds: ['prod-1'] },
      { ...base, id: 'p4', scope: 'PRODUCT', productIds: ['prod-1'], code: 'PROMO20' },
    ])

    expect(result.coupons.map((promotion) => promotion.id)).toEqual(['p1', 'p2', 'p4'])
    expect(result.productPromotions.map((promotion) => promotion.id)).toEqual(['p3'])
  })

  it('describe las condiciones de la promoción', () => {
    expect(
      promotionConditionLabels({
        minSubtotal: 5000,
        minQuantity: 2,
        maxDiscount: 1000,
        daysOfWeek: [5],
        startTime: '18:00',
        endTime: '23:00',
      }),
    ).toEqual([
      expect.stringContaining('Compra mínima'),
      'Mínimo 2 unidades',
      expect.stringContaining('Tope'),
      'Válida los Viernes',
      'De 18:00 a 23:00',
    ])
  })

  it('detecta precio estimado sólo cuando aplica', () => {
    const preview = (
      overrides: Partial<ProductPromotionPreview> = {},
    ): ProductPromotionPreview => ({
      promotionId: 'pr1',
      name: '20%',
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

    expect(hasEstimatedPrice(preview())).toBe(true)
    expect(hasEstimatedPrice(preview({ conditionsMet: false }))).toBe(false)
    expect(hasEstimatedPrice(preview({ estimatedUnitPrice: null }))).toBe(false)
  })

  it('arma labels accesibles y vigencia', () => {
    expect(
      promotionBadgeAriaLabel({
        promotionId: 'pr1',
        name: '20%',
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
      }),
    ).toBe('20% de descuento')
    expect(promotionValidityLabel('2026-11-01', '2026-11-30')).toContain('al')
    expect(
      daysUntilPromotionEnds('2026-11-30T00:00:00.000Z', new Date('2026-11-19T00:00:00.000Z')),
    ).toBe(11)
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
