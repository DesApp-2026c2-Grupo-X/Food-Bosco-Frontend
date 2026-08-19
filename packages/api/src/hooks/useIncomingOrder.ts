import { useEffect, useState } from 'react'
import { useSWRConfig } from 'swr'
import type { Order } from '@repo/domain'
import { createIncomingOrder } from '../mocks/orders'

const ORDERS_KEY = '/api/orders'
const ARRIVAL_DELAY_MS = 8000

interface UseIncomingOrderReturn {
  incoming: Order | null
  acknowledge: () => void
}

export const useIncomingOrder = (): UseIncomingOrderReturn => {
  const { mutate } = useSWRConfig()
  const [incoming, setIncoming] = useState<Order | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      const order = createIncomingOrder()
      setIncoming(order)
      void mutate(ORDERS_KEY)
    }, ARRIVAL_DELAY_MS)

    return () => clearTimeout(timer)
  }, [mutate])

  return { incoming, acknowledge: () => setIncoming(null) }
}
