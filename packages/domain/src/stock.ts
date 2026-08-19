import type { Ingredient } from './ingredient'

export interface BranchStock {
  ingredientId: number
  ingredient: Ingredient
  branchId: number
  quantity: number
}

export interface AdjustStockInput {
  branchId: number
  ingredientId: number
  delta: number
  reason: string
}
