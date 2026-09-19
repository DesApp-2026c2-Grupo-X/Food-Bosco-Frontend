import type { ReactNode } from 'react'
import type { OrderStatus } from '@repo/domain'

export interface OrderDetailShellProps {
  orderNumber?: number | string
  status: OrderStatus
  description?: ReactNode
  children: ReactNode
}
