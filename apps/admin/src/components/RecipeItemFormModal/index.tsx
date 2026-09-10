import { Heading } from '@chakra-ui/react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField, FormLayout, PrimaryButton, ResponsiveModal } from '@repo/components'
import { FormSelectField } from '../FormSelectField'
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

  const handleSubmit = form.handleSubmit(async (values) => {
    const input: RecipeItemInput = {
      ingredientId: values.ingredientId,
      quantity: Number(values.quantity),
    }
    await onSubmit(input)
  })

  return (
    <ResponsiveModal open onClose={onClose}>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
          <Heading as="h2" fontSize="xl" fontWeight="bold" marginBottom="4">
            {item ? 'Editar ingrediente' : 'Agregar ingrediente'}
          </Heading>
          <FormLayout>
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
            <PrimaryButton
              type="submit"
              width="full"
              disabled={!form.formState.isValid || isSubmitting}
              loading={isSubmitting}
            >
              Guardar
            </PrimaryButton>
          </FormLayout>
        </form>
      </FormProvider>
    </ResponsiveModal>
  )
}
