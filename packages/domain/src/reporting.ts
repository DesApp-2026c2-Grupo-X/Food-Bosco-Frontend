import type { Category, Product } from './catalog'

export interface ProductReportRow {
  position: number
  product: Product
  category?: Category
  quantity?: number
  revenue?: number
}

export interface OutOfStockRow {
  product: Product
  category?: Category
  quantity: number
}
