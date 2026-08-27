export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_DELIVERY'
  | 'ON_THE_WAY'
  | 'DELIVERED'
  | 'CANCELLED'

export interface OrderItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
}

export interface OrderLocation {
  label: string
  address: string
  lat: number
  lon: number
}

export interface OrderRider {
  name: string
  vehicle: string
}

export interface OrderCustomer {
  name: string
  phone: string
  email: string
}

export interface OrderStatusHistory {
  previousStatus: OrderStatus
  newStatus: OrderStatus
  changedAt: string
}

export interface Order {
  id: string
  number: number
  createdAt: string
  status: OrderStatus
  total: number
  itemCount: number
  branch: string
  eta?: string
  items: OrderItem[]
  deliveryAddress: string
  store: OrderLocation
  client: OrderLocation
  rider?: OrderRider
  cancelReason?: string
  deliveredAt?: string
  customer?: OrderCustomer
  statusHistory?: OrderStatusHistory[]
  availableTransitions?: OrderStatus[]
}
