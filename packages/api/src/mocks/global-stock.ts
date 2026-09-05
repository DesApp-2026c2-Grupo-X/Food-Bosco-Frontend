import type { BranchStock } from '@repo/domain'
import { MOCK_INGREDIENTS } from './ingredients'
import { MOCK_BRANCH_STOCK } from './branch-stock'

const buildForBranch = (branchId: string, offset: number): BranchStock[] =>
  MOCK_INGREDIENTS.map((ingredient, index) => ({
    ingredientId: ingredient.id,
    ingredient,
    branchId,
    quantity: (index * 3 + offset) % 15,
  }))

export const MOCK_GLOBAL_STOCK: BranchStock[] = [
  ...MOCK_BRANCH_STOCK,
  ...buildForBranch('2', 7),
  ...buildForBranch('3', 11),
]
