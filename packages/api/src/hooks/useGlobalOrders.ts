import { useQuery } from '@apollo/client'
import type { Order } from '@repo/domain'
import { ADMIN_ORDERS, toOrder } from '../client/admin'

interface UseGlobalOrdersReturn {
  orders: Order[]
  isLoading: boolean
}

interface OrdersResult {
  orders: Record<string, unknown>[]
}

export const useGlobalOrders = (): UseGlobalOrdersReturn => {
  const { data, loading } = useQuery<OrdersResult>(ADMIN_ORDERS, {
    fetchPolicy: 'network-only',
  })

  return {
    orders: (data?.orders ?? []).map(toOrder),
    isLoading: loading,
  }
}
