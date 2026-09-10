import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import type { BranchStock } from '@repo/domain'
import { ADJUST_STOCK, ADMIN_BRANCH_STOCK, toBranchStock } from '../client/admin'
import { useAuthStore } from '../stores/authStore'

interface UseBranchStockReturn {
  stock: BranchStock[]
  isLoading: boolean
  isAdjusting: boolean
  adjust: (ingredientId: string, delta: number, reason: string) => Promise<void>
}

interface BranchStockResult {
  branchStock: Record<string, unknown>[]
}

export const useBranchStock = (): UseBranchStockReturn => {
  const branchId = useAuthStore((state) => state.user?.branchId)

  const { data, loading, refetch } = useQuery<BranchStockResult>(ADMIN_BRANCH_STOCK, {
    variables: { branchId },
    skip: !branchId,
    fetchPolicy: 'network-only',
  })

  const [adjustMutation, { loading: adjusting }] = useMutation(ADJUST_STOCK)

  const adjust = useCallback(
    async (ingredientId: string, delta: number, reason: string) => {
      if (!branchId) return
      await adjustMutation({ variables: { input: { branchId, ingredientId, delta, reason } } })
      await refetch()
    },
    [adjustMutation, branchId, refetch],
  )

  return {
    stock: (data?.branchStock ?? []).map(toBranchStock),
    isLoading: loading,
    isAdjusting: adjusting,
    adjust,
  }
}
