import type { Order } from '@repo/domain'
import { useAuthStore } from '../stores/authStore'
import { useOrdersResource } from './useOrdersResource'

interface UseBranchOrdersReturn {
  orders: Order[]
  isLoading: boolean
}

export const useBranchOrders = (): UseBranchOrdersReturn => {
  const branchId = useAuthStore((state) => state.user?.branchId)
  return useOrdersResource({ branchId })
}
