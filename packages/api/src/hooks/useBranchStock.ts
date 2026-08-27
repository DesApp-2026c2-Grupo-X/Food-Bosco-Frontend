import { useCallback, useState } from 'react'
import useSWR from 'swr'
import type { BranchStock } from '@repo/domain'
import { getJson, postJson } from '../client/rest'
import { MOCK_BRANCH_STOCK, MOCK_BRANCH_ID } from '../mocks/branch-stock'

const KEY = '/api/stock'

interface UseBranchStockReturn {
  stock: BranchStock[]
  isLoading: boolean
  isAdjusting: boolean
  adjust: (ingredientId: number, delta: number, reason: string) => Promise<void>
}

export const useBranchStock = (): UseBranchStockReturn => {
  const { data, isLoading, mutate } = useSWR<BranchStock[]>(KEY, async (url: string) => {
    const json = await getJson<BranchStock[]>(url)
    if (json && Array.isArray(json) && json.length > 0) {
      return json
    }
    return MOCK_BRANCH_STOCK
  })

  const [isAdjusting, setIsAdjusting] = useState(false)

  const adjust = useCallback(
    async (ingredientId: number, delta: number, reason: string) => {
      setIsAdjusting(true)

      const updated = (data ?? MOCK_BRANCH_STOCK).map((row) =>
        row.ingredientId === ingredientId
          ? { ...row, quantity: Math.max(0, row.quantity + delta) }
          : row,
      )
      const mockRow = MOCK_BRANCH_STOCK.find((row) => row.ingredientId === ingredientId)
      if (mockRow) mockRow.quantity = Math.max(0, mockRow.quantity + delta)

      await mutate(updated, { revalidate: false })
      await postJson('/api/stock/adjustments', {
        branchId: MOCK_BRANCH_ID,
        ingredientId,
        delta,
        reason,
      })
      setIsAdjusting(false)
    },
    [data, mutate],
  )

  return { stock: data ?? [], isLoading, isAdjusting, adjust }
}
