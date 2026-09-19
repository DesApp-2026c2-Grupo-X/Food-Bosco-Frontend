import { useCallback } from 'react'
import type { BranchStock } from '@repo/domain'
import { useAuthStore } from '../stores/authStore'
import { useStockResource } from './useStockResource'

interface UseBranchStockReturn {
  stock: BranchStock[]
  isLoading: boolean
  isAdjusting: boolean
  adjust: (ingredientId: string, delta: number, reason: string) => Promise<void>
}

export const useBranchStock = (): UseBranchStockReturn => {
  const branchId = useAuthStore((state) => state.user?.branchId)
  const { stock, isLoading, isAdjusting, adjust } = useStockResource(branchId, !branchId)

  const adjustBranchStock = useCallback(
    async (ingredientId: string, delta: number, reason: string) => {
      if (!branchId) return
      await adjust(branchId, ingredientId, delta, reason)
    },
    [adjust, branchId],
  )

  return { stock, isLoading, isAdjusting, adjust: adjustBranchStock }
}
