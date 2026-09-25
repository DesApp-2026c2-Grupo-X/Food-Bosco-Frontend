import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField, FormModal, FormSelectField } from '@repo/components'
import { recipeItemSchema, type RecipeItemForm, type RecipeItemInput } from '@repo/domain'
import type { RecipeItemFormModalProps } from './types'

export const RecipeItemFormModal = ({
  item,
  ingredients,
  isSubmitting,
  onClose,
  onSubmit,
}: RecipeItemFormModalProps) => {
  const form = useForm<RecipeItemForm>({
    resolver: zodResolver(recipeItemSchema),
    defaultValues: {
      ingredientId: item ? String(item.ingredientId) : '',
      quantity: item ? String(item.quantity) : '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const options = ingredients.map((ingredient) => ({
    value: String(ingredient.id),
    label: ingredient.name,
  }))

  return (
    <FormModal
      open
      onClose={onClose}
      title={item ? 'Editar ingrediente' : 'Agregar ingrediente'}
      form={form}
      isSubmitting={isSubmitting}
      onSubmit={async (values) => {
        const input: RecipeItemInput = {
          ingredientId: values.ingredientId,
          quantity: Number(values.quantity),
        }
        await onSubmit(input)
      }}
    >
      <FormSelectField
        name="ingredientId"
        label="Ingrediente"
        required
        options={options}
        placeholder="Seleccionar ingrediente..."
      />
      <FormField
        name="quantity"
        label="Cantidad"
        required
        inputMode="decimal"
        placeholder="Ej: 1"
      />
    </FormModal>
  )
}
