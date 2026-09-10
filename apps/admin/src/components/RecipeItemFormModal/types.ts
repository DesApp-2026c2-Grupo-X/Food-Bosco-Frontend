import type { Ingredient, RecipeItem, RecipeItemInput } from '@repo/domain'

export interface RecipeItemFormModalProps {
  item: RecipeItem | null
  ingredients: Ingredient[]
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (input: RecipeItemInput) => Promise<void>
}
