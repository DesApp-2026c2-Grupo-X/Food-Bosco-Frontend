export interface OrderItemsCardOption {
  name: string
}

export interface OrderItemsCardLine {
  productId: string
  name: string
  quantity: number
  subtotal: number
  options?: OrderItemsCardOption[]
  observations?: string | null
  key?: string
}

export interface OrderItemsCardProps {
  items: OrderItemsCardLine[]
  title?: string
}
