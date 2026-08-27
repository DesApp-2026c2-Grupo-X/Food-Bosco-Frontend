import { useCallback, useState } from 'react'
import useSWR from 'swr'
import { getNextStatuses, type Order, type OrderStatus } from '@repo/domain'
import { getJson, patchJson } from '../client/rest'
import { getOrderById, MOCK_ORDERS, withTransitions } from '../mocks/orders'

interface UseAdminOrderReturn {
  order: Order | null
  isLoading: boolean
  isMutating: boolean
  changeStatus: (newStatus: OrderStatus) => Promise<void>
}

export const useAdminOrder = (orderId: string | undefined): UseAdminOrderReturn => {
  const { data, isLoading, mutate } = useSWR<Order | null>(
    orderId ? `/api/orders/${orderId}` : null,
    async (url: string) => {
      const json = await getJson<Order>(url)
      if (json && typeof json === 'object' && 'id' in json) {
        return withTransitions(json)
      }
      return orderId ? withTransitions(getOrderById(orderId)) : null
    },
  )

  const [isMutating, setIsMutating] = useState(false)

  const changeStatus = useCallback(
    async (newStatus: OrderStatus) => {
      if (!orderId) return
      setIsMutating(true)

      const current = data ?? (orderId ? getOrderById(orderId) : null)
      if (current) {
        const changedAt = new Date().toISOString()
        const updated: Order = {
          ...current,
          status: newStatus,
          statusHistory: [
            ...(current.statusHistory ?? []),
            { previousStatus: current.status, newStatus, changedAt },
          ],
          availableTransitions: getNextStatuses(newStatus),
        }

        const index = MOCK_ORDERS.findIndex((order) => order.id === current.id)
        if (index !== -1) MOCK_ORDERS[index] = updated

        await mutate(updated, { revalidate: false })
      }

      await patchJson(`/api/orders/${orderId}/status`, { status: newStatus })
      setIsMutating(false)
    },
    [data, mutate, orderId],
  )

  return { order: data ?? null, isLoading, isMutating, changeStatus }
}
