import { useCallback, useState } from 'react'
import useSWR from 'swr'
import type { BranchStock } from '@repo/domain'
import { getJson, postJson } from '../client/rest'
import { MOCK_GLOBAL_STOCK } from '../mocks/global-stock'

const KEY = '/api/stock'

interface UseGlobalStockReturn {
  stock: BranchStock[]
  isLoading: boolean
  isAdjusting: boolean
  adjust: (branchId: string, ingredientId: string, delta: number, reason: string) => Promise<void>
}

export const useGlobalStock = (): UseGlobalStockReturn => {
  const { data, isLoading, mutate } = useSWR<BranchStock[]>(KEY, async (url: string) => {
    const json = await getJson<BranchStock[]>(url)
    if (json && Array.isArray(json) && json.length > 0) return json
    return MOCK_GLOBAL_STOCK
  })

  const [isAdjusting, setIsAdjusting] = useState(false)

  const adjust = useCallback(
    async (branchId: string, ingredientId: string, delta: number, reason: string) => {
      setIsAdjusting(true)
      const current = data ?? MOCK_GLOBAL_STOCK
      const next = current.map((row) =>
        row.branchId === branchId && row.ingredientId === ingredientId
          ? { ...row, quantity: Math.max(0, row.quantity + delta) }
          : row,
      )
      const mock = MOCK_GLOBAL_STOCK.find(
        (row) => row.branchId === branchId && row.ingredientId === ingredientId,
      )
      if (mock) mock.quantity = Math.max(0, mock.quantity + delta)
      await mutate(next, { revalidate: false })
      await postJson('/api/stock/adjustments', { branchId, ingredientId, delta, reason })
      setIsAdjusting(false)
    },
    [data, mutate],
  )

  return { stock: data ?? [], isLoading, isAdjusting, adjust }
}
