import type { Product, ProductOption } from './catalog'

export interface CartItem {
  id: string
  productId: string
  product?: Product | null
  quantity: number
  observations: string | null
  optionIds: string[]
  options: ProductOption[]
}

export interface Cart {
  id: string
  clientId: string
  status: string
  items: CartItem[]
  total: number
}

export interface AddCartItemInput {
  productId: string
  quantity: number
  observations?: string | null
  optionIds?: string[]
}

export interface UpdateCartItemInput {
  quantity?: number
  observations?: string | null
  optionIds?: string[]
}

export const cartLineUnitPrice = (item: CartItem): number => {
  const base = item.product?.price ?? 0
  const extras = item.options.reduce((sum, option) => sum + option.extraPrice, 0)
  return base + extras
}

export const cartLineTotal = (item: CartItem): number => cartLineUnitPrice(item) * item.quantity

export const cartItemCount = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + item.quantity, 0)

export const cartTotal = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + cartLineTotal(item), 0)
