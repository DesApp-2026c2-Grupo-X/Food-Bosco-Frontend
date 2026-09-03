import type { Ingredient } from './ingredient'

export interface BranchStock {
  ingredientId: string
  ingredient?: Ingredient | null
  branchId: string
  quantity: number
}

export interface AdjustStockInput {
  branchId: string
  ingredientId: string
  delta: number
  reason: string
}
