import type { RecipeItem } from '@repo/domain'
import { getIngredientById } from './ingredients'

const item = (id: number, ingredientId: number, quantity: number): RecipeItem => {
  const ingredient = getIngredientById(ingredientId)
  if (!ingredient) {
    throw new Error(`Ingredient ${ingredientId} not found`)
  }
  return { id, ingredientId, quantity, ingredient }
}

export const MOCK_RECIPES: Record<number, RecipeItem[]> = {
  101: [item(1011, 1, 1), item(1012, 2, 1), item(1013, 3, 1), item(1014, 4, 1), item(1015, 5, 1)],
  102: [item(1021, 1, 1), item(1022, 2, 2), item(1023, 3, 2)],
  201: [item(2011, 6, 1), item(2012, 7, 150), item(2013, 8, 80)],
  202: [item(2021, 6, 1), item(2022, 7, 150), item(2023, 8, 80), item(2024, 5, 1)],
  301: [item(3011, 9, 0.4)],
  302: [item(3021, 9, 0.3)],
  303: [item(3031, 4, 1), item(3032, 5, 1)],
  401: [item(4011, 10, 1)],
  402: [item(4021, 12, 0.3)],
  501: [item(5011, 11, 2)],
  502: [item(5021, 11, 2), item(5022, 12, 0.25)],
  503: [item(5031, 7, 40)],
}

export const getProductRecipe = (productId: number): RecipeItem[] => MOCK_RECIPES[productId] ?? []
