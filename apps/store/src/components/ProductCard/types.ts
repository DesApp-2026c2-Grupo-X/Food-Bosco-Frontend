import type { Product } from '@repo/domain'

export interface ProductCardProps {
  product: Product
  hint?: string | null
  showPromotion?: boolean
}
