import type { AppliedPromotion } from '@repo/domain'

export interface OrderTotalCardProps {
  total: number
  subtotal?: number
  discountTotal?: number
  appliedPromotions?: AppliedPromotion[]
  subtitle?: string
}
