import useSWR from 'swr'
import type { Order } from '@repo/domain'
import { getJson } from '../client/rest'
import { MOCK_ORDERS } from '../mocks/orders'

const KEY = '/api/orders'

interface UseGlobalOrdersReturn {
  orders: Order[]
  isLoading: boolean
}

export const useGlobalOrders = (): UseGlobalOrdersReturn => {
  const { data, isLoading } = useSWR<Order[]>(KEY, async (url: string) => {
    const json = await getJson<Order[]>(url)
    if (json && Array.isArray(json) && json.length > 0) return json
    return MOCK_ORDERS
  })

  return { orders: data ?? [], isLoading }
}
