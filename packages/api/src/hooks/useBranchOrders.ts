import useSWR from 'swr'
import type { Order } from '@repo/domain'
import { getJson } from '../client/rest'
import { MOCK_BRANCH_NAME } from '../mocks/branch'
import { getBranchOrders } from '../mocks/orders'

const KEY = '/api/orders'

interface UseBranchOrdersReturn {
  orders: Order[]
  isLoading: boolean
}

export const useBranchOrders = (): UseBranchOrdersReturn => {
  const { data, isLoading } = useSWR<Order[]>(KEY, async (url: string) => {
    const json = await getJson<Order[]>(url)
    if (json && Array.isArray(json) && json.length > 0) {
      return json
    }
    return getBranchOrders(MOCK_BRANCH_NAME)
  })

  return { orders: data ?? [], isLoading }
}
