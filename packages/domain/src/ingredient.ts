export interface Ingredient {
  id: string
  name: string
  unit: string
  active: boolean
}

export interface RecipeItem {
  id: string
  ingredientId: string
  quantity: number
  ingredient?: Ingredient | null
}

export interface IngredientInput {
  name: string
  unit: string
  active: boolean
}

export interface RecipeItemInput {
  ingredientId: string
  quantity: number
}
