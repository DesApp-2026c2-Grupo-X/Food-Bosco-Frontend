import { useQuery } from '@apollo/client'
import type { Order } from '@repo/domain'
import { ORDER, toOrder } from '../client/store'

interface UseOrderReturn {
  order: Order | null
  isLoading: boolean
}

interface OrderResult {
  order: Record<string, unknown> | null
}

export const useOrder = (orderId: string | undefined): UseOrderReturn => {
  const { data, loading } = useQuery<OrderResult>(ORDER, {
    variables: { id: orderId },
    skip: !orderId,
  })

  return {
    order: data?.order ? toOrder(data.order) : null,
    isLoading: loading,
  }
}
