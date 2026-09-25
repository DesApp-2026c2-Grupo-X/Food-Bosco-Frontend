import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import type { Order, OrderStatus } from '@repo/domain'
import { ADMIN_ORDER, CHANGE_ORDER_STATUS, RELEASE_ORDER_RIDER, toOrder } from '../client/admin'
import { combineLoading } from '../utils/combineLoading'

interface UseAdminOrderReturn {
  order: Order | null
  isLoading: boolean
  isMutating: boolean
  changeStatus: (newStatus: OrderStatus) => Promise<void>
  releaseRider: () => Promise<void>
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
  const [releaseRiderMutation, { loading: releasing }] = useMutation(RELEASE_ORDER_RIDER)

  const changeStatus = useCallback(
    async (newStatus: OrderStatus) => {
      if (!orderId) return
      await changeStatusMutation({ variables: { orderId, status: newStatus } })
      await refetch()
    },
    [changeStatusMutation, orderId, refetch],
  )

  const releaseRider = useCallback(async () => {
    if (!orderId) return
    await releaseRiderMutation({ variables: { orderId } })
    await refetch()
  }, [releaseRiderMutation, orderId, refetch])

  return {
    order: data?.order ? toOrder(data.order) : null,
    isLoading: loading,
    isMutating: combineLoading(mutating, releasing),
    changeStatus,
    releaseRider,
  }
}
