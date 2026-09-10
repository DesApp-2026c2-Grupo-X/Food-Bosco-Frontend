import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import type { Order, OrderStatus } from '@repo/domain'
import { ADMIN_ORDER, CHANGE_ORDER_STATUS, toOrder } from '../client/admin'

interface UseAdminOrderReturn {
  order: Order | null
  isLoading: boolean
  isMutating: boolean
  changeStatus: (newStatus: OrderStatus) => Promise<void>
}

interface OrderResult {
  order: Record<string, unknown> | null
}

export const useAdminOrder = (orderId: string | undefined): UseAdminOrderReturn => {
  const { data, loading, refetch } = useQuery<OrderResult>(ADMIN_ORDER, {
    variables: { id: orderId },
    skip: !orderId,
    fetchPolicy: 'network-only',
  })

  const [changeStatusMutation, { loading: mutating }] = useMutation(CHANGE_ORDER_STATUS)

  const changeStatus = useCallback(
    async (newStatus: OrderStatus) => {
      if (!orderId) return
      await changeStatusMutation({ variables: { orderId, status: newStatus } })
      await refetch()
    },
    [changeStatusMutation, orderId, refetch],
  )

  return {
    order: data?.order ? toOrder(data.order) : null,
    isLoading: loading,
    isMutating: mutating,
    changeStatus,
  }
}
