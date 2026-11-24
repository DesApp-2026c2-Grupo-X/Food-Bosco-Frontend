import type { Category, Product } from './catalog'
import { formatPrice } from './format'

export type PromotionType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y'
export type PromotionScope = 'ORDER' | 'CATEGORY' | 'PRODUCT'

export interface AppliedPromotion {
  promotionId: string
  name: string
  code?: string | null
  amount: number
}

export interface Promotion {
  id: string
  name: string
  description: string | null
  startDate: string
  endDate: string
  active: boolean
  type: PromotionType | null
  discountValue: number | null
  maxDiscount: number | null
  buyQuantity: number | null
  payQuantity: number | null
  scope: PromotionScope | null
  categoryIds: string[]
  productIds: string[]
  branchIds: string[]
  minSubtotal: number
  minQuantity: number
  daysOfWeek: number[]
  startTime: string | null
  endTime: string | null
  code: string | null
  stackable: boolean
  priority: number
  maxUsesTotal: number | null
  maxUsesPerCustomer: number | null
  usedCount: number
}

export type PromotionBadgeKind =
  'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y' | 'COUPON' | 'INFORMATIONAL'

export interface ProductPromotionPreview {
  promotionId: string
  name: string
  kind: PromotionBadgeKind
  badge: string
  originalPrice: number
  estimatedUnitPrice: number | null
  discountValue: number | null
  maxDiscount: number | null
  minSubtotal: number
  minQuantity: number
  conditionsMet: boolean
  promotionCount: number
  endsAt: string
}

export interface PromotionCatalogItem {
  id: string
  name: string
  description: string | null
  type: PromotionType | null
  scope: PromotionScope | null
  kind: PromotionBadgeKind
  badge: string
  discountValue: number | null
  maxDiscount: number | null
  buyQuantity: number | null
  payQuantity: number | null
  startDate: string
  endDate: string
  daysOfWeek: number[]
  startTime: string | null
  endTime: string | null
  minSubtotal: number
  minQuantity: number
  branchIds: string[]
  code: string | null
  categoryIds: string[]
  productIds: string[]
  categories: Category[]
  products: Product[]
}

export interface PromotionInput {
  name: string
  description?: string | null
  startDate: string
  endDate: string
  active?: boolean
  type?: PromotionType | null
  discountValue?: number | null
  maxDiscount?: number | null
  buyQuantity?: number | null
  payQuantity?: number | null
  scope?: PromotionScope | null
  categoryIds?: string[]
  productIds?: string[]
  branchIds?: string[]
  minSubtotal?: number
  minQuantity?: number
  daysOfWeek?: number[]
  startTime?: string | null
  endTime?: string | null
  code?: string | null
  stackable?: boolean
  priority?: number
  maxUsesTotal?: number | null
  maxUsesPerCustomer?: number | null
}

export const DAYS_OF_WEEK_LABELS: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
}

export const describePromotion = (
  p: Pick<
    Partial<Promotion>,
    'type' | 'discountValue' | 'maxDiscount' | 'buyQuantity' | 'payQuantity' | 'scope'
  >,
): string => {
  if (!p.type) return 'Promoción informativa'

  switch (p.type) {
    case 'PERCENTAGE': {
      const pct = p.discountValue ?? 0
      const cap = p.maxDiscount ? ` (tope $${p.maxDiscount.toLocaleString('es-AR')})` : ''
      return `${pct}% de descuento${cap}`
    }
    case 'FIXED_AMOUNT': {
      const val = p.discountValue ?? 0
      return `$${val.toLocaleString('es-AR')} de descuento`
    }
    case 'BUY_X_GET_Y': {
      const buy = p.buyQuantity ?? 0
      const pay = p.payQuantity ?? 0
      return `${buy}x${pay}`
    }
    default:
      return 'Promoción'
  }
}

export const isProductPromotion = (
  promotion: Pick<Promotion, 'scope' | 'productIds' | 'code'>,
): boolean =>
  !promotion.code && (promotion.scope === 'PRODUCT' || promotion.productIds.length > 0)

/**
 * Separa cupones generales de promociones que apuntan a productos concretos.
 * Las promociones de producto se muestran como productos; los cupones, aunque
 * afecten productos, se muestran en la sección de cupones con su código.
 */
export const splitPromotions = <T extends Pick<Promotion, 'scope' | 'productIds' | 'code'>>(
  promotions: T[],
): { coupons: T[]; productPromotions: T[] } => ({
  coupons: promotions.filter((promotion) => !isProductPromotion(promotion)),
  productPromotions: promotions.filter(isProductPromotion),
})

/**
 * Categoría a la que conviene llevar el CTA de una promoción.
 * Para promociones por categoría usa el primer `categoryId`; para promociones
 * por producto resuelve la categoría del primer producto afectado.
 */
export const getPromotionCategoryId = (
  promotion: Pick<Promotion, 'categoryIds' | 'productIds'>,
  products: Pick<Product, 'id' | 'categoryId'>[],
): string | null => {
  const explicitCategory = promotion.categoryIds.find((id) => id.length > 0)
  if (explicitCategory) return explicitCategory

  if (promotion.productIds.length === 0) return null

  const categoryByProduct = new Map(products.map((product) => [product.id, product.categoryId]))
  for (const productId of promotion.productIds) {
    const categoryId = categoryByProduct.get(productId)
    if (categoryId) return categoryId
  }

  return null
}

export const formatDiscount = (amount: number): string => {
  if (amount <= 0) return '$0'
  return `-$${amount.toLocaleString('es-AR')}`
}

export const isPromotionActive = (p: Promotion, now: Date = new Date()): boolean => {
  if (!p.active) return false
  const start = new Date(p.startDate)
  const end = new Date(p.endDate)
  return now >= start && now <= end
}

export const hasEstimatedPrice = (preview: ProductPromotionPreview | null | undefined): boolean =>
  preview != null && preview.conditionsMet && preview.estimatedUnitPrice != null

export const promotionConditionLabels = (
  promotion: Pick<
    Promotion,
    'minSubtotal' | 'minQuantity' | 'maxDiscount' | 'daysOfWeek' | 'startTime' | 'endTime'
  >,
): string[] => {
  const labels: string[] = []

  if (promotion.minSubtotal > 0) {
    labels.push(`Compra mínima ${formatPrice(promotion.minSubtotal)}`)
  }
  if (promotion.minQuantity > 0) {
    labels.push(`Mínimo ${promotion.minQuantity} unidades`)
  }
  if (promotion.maxDiscount != null) {
    labels.push(`Tope ${formatPrice(promotion.maxDiscount)}`)
  }
  if (promotion.daysOfWeek.length > 0) {
    const days = promotion.daysOfWeek.map((day) => DAYS_OF_WEEK_LABELS[day]).filter(Boolean)
    labels.push(`Válida los ${days.join(', ')}`)
  }
  if (promotion.startTime && promotion.endTime) {
    labels.push(`De ${promotion.startTime} a ${promotion.endTime}`)
  }

  return labels
}

export const promotionValidityLabel = (startDate: string, endDate: string): string => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const includeYear = start.getFullYear() !== end.getFullYear()
  const format = (date: Date) =>
    date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      ...(includeYear ? { year: 'numeric' } : {}),
    })
  return `Del ${format(start)} al ${format(end)}`
}

export const promotionBadgeAriaLabel = (preview: ProductPromotionPreview): string => {
  if (preview.kind === 'PERCENTAGE' && preview.discountValue != null) {
    return `${preview.discountValue}% de descuento`
  }
  return preview.badge
}

export const daysUntilPromotionEnds = (endsAt: string, now: Date = new Date()): number => {
  const diff = new Date(endsAt).getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)))
}
