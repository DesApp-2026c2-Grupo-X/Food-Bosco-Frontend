export interface Ingredient {
  id: number
  name: string
  unit: string
  active: boolean
}

export interface RecipeItem {
  id: number
  ingredientId: number
  quantity: number
  ingredient: Ingredient
}

export interface IngredientInput {
  name: string
  unit: string
  active: boolean
}

export interface RecipeItemInput {
  ingredientId: number
  quantity: number
}
