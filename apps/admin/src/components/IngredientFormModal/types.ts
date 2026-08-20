import type { Ingredient, IngredientInput } from '@repo/domain'

export interface IngredientFormModalProps {
  ingredient: Ingredient | null
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (input: IngredientInput) => Promise<void>
}
