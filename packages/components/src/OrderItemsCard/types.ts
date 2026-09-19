export interface OrderItemsCardLine {
  productId: string
  name: string
  quantity: number
  subtotal: number
}

export interface OrderItemsCardProps {
  items: OrderItemsCardLine[]
  title?: string
}
