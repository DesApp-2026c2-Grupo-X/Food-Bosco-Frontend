import type { Promotion } from '@repo/domain'

export type PromotionCardItem = Pick<
  Promotion,
  | 'id'
  | 'name'
  | 'description'
  | 'type'
  | 'discountValue'
  | 'maxDiscount'
  | 'buyQuantity'
  | 'payQuantity'
  | 'scope'
  | 'categoryIds'
  | 'productIds'
  | 'startDate'
  | 'endDate'
  | 'daysOfWeek'
  | 'startTime'
  | 'endTime'
  | 'minSubtotal'
  | 'minQuantity'
  | 'code'
> & {
  badge?: string
}

export interface PromotionCardProps {
  promotion: PromotionCardItem
  ctaPath: string
  ctaLabel?: string
}
