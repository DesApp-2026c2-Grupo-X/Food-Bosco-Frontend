import type { BranchStock } from '@repo/domain'
import { useStockResource } from './useStockResource'

interface UseGlobalStockReturn {
  stock: BranchStock[]
  isLoading: boolean
  isAdjusting: boolean
  adjust: (branchId: string, ingredientId: string, delta: number, reason: string) => Promise<void>
}

export const useGlobalStock = (): UseGlobalStockReturn => useStockResource()
