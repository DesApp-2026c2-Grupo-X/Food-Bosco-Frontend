import { useQuery } from '@apollo/client'
import type { Order } from '@repo/domain'
import { MY_ORDERS, toOrder } from '../client/store'

interface UseOrdersReturn {
  orders: Order[]
  isLoading: boolean
}

interface MyOrdersResult {
  myOrders: Record<string, unknown>[]
}

interface UseOrdersOptions {
  pollIntervalMs?: number
}

export const useOrders = (options?: UseOrdersOptions): UseOrdersReturn => {
  const { data, loading } = useQuery<MyOrdersResult>(MY_ORDERS, {
    fetchPolicy: 'network-only',
    pollInterval: options?.pollIntervalMs,
  })

  return {
    orders: (data?.myOrders ?? []).map(toOrder),
    isLoading: loading,
  }
}
