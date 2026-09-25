import type { Order } from '@repo/domain'
import { useOrdersResource } from './useOrdersResource'

interface UseGlobalOrdersReturn {
  orders: Order[]
  isLoading: boolean
}

export const useGlobalOrders = (): UseGlobalOrdersReturn => useOrdersResource()
