import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import type { BranchStock } from '@repo/domain'
import { ADJUST_STOCK, ADMIN_BRANCH_STOCK, toBranchStock } from '../client/admin'

export interface StockResource {
  stock: BranchStock[]
  isLoading: boolean
  isAdjusting: boolean
  adjust: (branchId: string, ingredientId: string, delta: number, reason: string) => Promise<void>
}

interface BranchStockResult {
  branchStock: Record<string, unknown>[]
}

export const useStockResource = (branchId?: string, skip = false): StockResource => {
  const { data, loading, refetch } = useQuery<BranchStockResult>(ADMIN_BRANCH_STOCK, {
    variables: branchId === undefined ? undefined : { branchId },
    skip,
    fetchPolicy: 'network-only',
  })

  const [adjustMutation, { loading: adjusting }] = useMutation(ADJUST_STOCK)

  const adjust = useCallback(
    async (targetBranchId: string, ingredientId: string, delta: number, reason: string) => {
      await adjustMutation({
        variables: { input: { branchId: targetBranchId, ingredientId, delta, reason } },
      })
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
