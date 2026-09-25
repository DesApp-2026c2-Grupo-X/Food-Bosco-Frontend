import { useQuery } from '@apollo/client'
import type { Order } from '@repo/domain'
import { ADMIN_ORDERS, toOrder } from '../client/admin'

export interface OrdersFilter {
  branchId?: string
}

export interface OrdersResource {
  orders: Order[]
  isLoading: boolean
}

interface OrdersResult {
  orders: Record<string, unknown>[]
}

export const useOrdersResource = (filter?: OrdersFilter): OrdersResource => {
  const { data, loading } = useQuery<OrdersResult>(ADMIN_ORDERS, {
    variables: filter === undefined ? undefined : { filter },
    skip: filter === undefined ? undefined : !filter.branchId,
    fetchPolicy: 'network-only',
  })

  return {
    orders: (data?.orders ?? []).map(toOrder),
    isLoading: loading,
  }
}
