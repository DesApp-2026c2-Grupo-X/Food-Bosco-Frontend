import type { OrderStatusCount } from '@repo/domain'

export interface OrderStatusChartProps {
  data: OrderStatusCount[]
  isLoading?: boolean
}
