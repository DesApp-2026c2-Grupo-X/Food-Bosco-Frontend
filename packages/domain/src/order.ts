import type { Branch } from './branch'
import type { User } from './user'

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_DELIVERY'
  | 'ON_THE_WAY'
  | 'DELIVERED'
  | 'CANCELLED'

export interface OrderItemOption {
  optionId: string
  name: string
  extraPrice: number
}

export interface OrderItem {
  productId: string
  name: string
  unitPrice: number
  quantity: number
  observations: string | null
  subtotal: number
  options: OrderItemOption[]
}

export interface OrderStatusHistory {
  previousStatus: OrderStatus
  newStatus: OrderStatus
  changedAt: string
}

export interface OrderAddress {
  text: string
  latitude: number
  longitude: number
}

export interface Order {
  id: string
  number: string
  clientId: string
  branchId: string
  branch?: Branch | null
  client?: User | null
  deliveryAddress: OrderAddress
  status: OrderStatus
  total: number
  estimatedDeliveryAt: string | null
  createdAt: string
  items: OrderItem[]
  statusHistory: OrderStatusHistory[]
  availableTransitions: OrderStatus[]
}
