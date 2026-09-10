import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import type { BranchStock } from '@repo/domain'
import { ADJUST_STOCK, ADMIN_BRANCH_STOCK, toBranchStock } from '../client/admin'

interface UseGlobalStockReturn {
  stock: BranchStock[]
  isLoading: boolean
  isAdjusting: boolean
  adjust: (branchId: string, ingredientId: string, delta: number, reason: string) => Promise<void>
}

interface BranchStockResult {
  branchStock: Record<string, unknown>[]
}

export const useGlobalStock = (): UseGlobalStockReturn => {
  const { data, loading, refetch } = useQuery<BranchStockResult>(ADMIN_BRANCH_STOCK, {
    fetchPolicy: 'network-only',
  })

  const [adjustMutation, { loading: adjusting }] = useMutation(ADJUST_STOCK)

  const adjust = useCallback(
    async (branchId: string, ingredientId: string, delta: number, reason: string) => {
      await adjustMutation({ variables: { input: { branchId, ingredientId, delta, reason } } })
      await refetch()
    },
    [adjustMutation, refetch],
  )

  return {
    stock: (data?.branchStock ?? []).map(toBranchStock),
    isLoading: loading,
    isAdjusting: adjusting,
    adjust,
  }
}
