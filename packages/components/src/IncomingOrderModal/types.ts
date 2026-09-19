export interface IncomingOrderModalOrder {
  id: string
  number: string | number
  client?: { firstName: string; lastName: string } | null
  deliveryAddress: { text: string }
  items: { quantity: number }[]
  total: number
}

export interface IncomingOrderModalProps {
  order: IncomingOrderModalOrder | null
  onClose: () => void
  orderDetailPath: (orderId: string) => string
}
