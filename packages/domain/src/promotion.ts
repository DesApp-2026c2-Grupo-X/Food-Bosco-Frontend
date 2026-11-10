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
