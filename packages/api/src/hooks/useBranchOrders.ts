import { useQuery } from '@apollo/client'
import type { Order } from '@repo/domain'
import { ADMIN_ORDERS, toOrder } from '../client/admin'
import { useAuthStore } from '../stores/authStore'

interface UseBranchOrdersReturn {
  orders: Order[]
  isLoading: boolean
}

interface OrdersResult {
  orders: Record<string, unknown>[]
}

export const useBranchOrders = (): UseBranchOrdersReturn => {
  const branchId = useAuthStore((state) => state.user?.branchId)

  const { data, loading } = useQuery<OrdersResult>(ADMIN_ORDERS, {
    variables: { filter: { branchId } },
    skip: !branchId,
    fetchPolicy: 'network-only',
  })

  return {
    orders: (data?.orders ?? []).map(toOrder),
    isLoading: loading,
  }
}
