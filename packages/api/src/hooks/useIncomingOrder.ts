import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@apollo/client'
import type { Order } from '@repo/domain'
import { ADMIN_ORDERS, toOrder } from '../client/admin'
import { useAuthStore } from '../stores/authStore'

const POLL_INTERVAL_MS = 5000

interface UseIncomingOrderReturn {
  incoming: Order | null
  acknowledge: () => void
}

interface OrdersResult {
  orders: Record<string, unknown>[]
}

export const useIncomingOrder = (): UseIncomingOrderReturn => {
  const branchId = useAuthStore((state) => state.user?.branchId)
  const [incoming, setIncoming] = useState<Order | null>(null)
  const seenIds = useRef<Set<string>>(new Set())

  const { data } = useQuery<OrdersResult>(ADMIN_ORDERS, {
    variables: { filter: { branchId, status: 'PENDING' } },
    skip: !branchId,
    pollInterval: POLL_INTERVAL_MS,
    fetchPolicy: 'network-only',
  })

  const orders = (data?.orders ?? []).map(toOrder)

  useEffect(() => {
    if (orders.length === 0) return

    if (seenIds.current.size === 0) {
      orders.forEach((order) => seenIds.current.add(order.id))
      return
    }

    const fresh = orders.find((order) => !seenIds.current.has(order.id))
    if (fresh) {
      seenIds.current.add(fresh.id)
      setIncoming(fresh)
    }
  }, [orders])

  return { incoming, acknowledge: () => setIncoming(null) }
}
