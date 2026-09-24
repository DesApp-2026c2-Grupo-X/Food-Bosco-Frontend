import type { BranchStock } from '@repo/domain'
import { getIngredientById } from './ingredients'

export const MOCK_BRANCH_ID = '1'

const stockRow = (ingredientId: string, quantity: number): BranchStock => {
  const ingredient = getIngredientById(ingredientId)
  if (!ingredient) {
    throw new Error(`Ingredient ${ingredientId} not found`)
  }
  return { ingredientId, ingredient, branchId: MOCK_BRANCH_ID, quantity }
}

export const MOCK_BRANCH_STOCK: BranchStock[] = [
  stockRow('1', 5),
  stockRow('2', 12),
  stockRow('3', 8),
  stockRow('4', 4),
  stockRow('5', 6),
  stockRow('6', 0),
  stockRow('7', 900),
  stockRow('8', 1200),
  stockRow('9', 15),
  stockRow('10', 20),
  stockRow('11', 7),
  stockRow('12', 0),
]
