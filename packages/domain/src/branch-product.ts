import type { Product } from './catalog'

export interface BranchProduct {
  product: Product
  categoryName: string
  available: boolean
}
