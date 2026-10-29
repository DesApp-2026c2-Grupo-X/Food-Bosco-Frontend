import type { Cart } from './cart'

export type RepeatSkipReason = 'PRODUCT_NOT_FOUND' | 'PRODUCT_UNAVAILABLE' | 'OPTION_UNAVAILABLE'

export interface RepeatSkippedItem {
  productId: string
  name: string
  reason: RepeatSkipReason
}

export interface RepeatPriceChange {
  productId: string
  name: string
  quantity: number
  previousUnitPrice: number
  currentUnitPrice: number
}

export interface RepeatOrderResult {
  cart: Cart
  skippedItems: RepeatSkippedItem[]
  priceChanges: RepeatPriceChange[]
}
