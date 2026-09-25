import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField, FormModal, SwitchRow } from '@repo/components'
import { ingredientSchema, type IngredientForm, type IngredientInput } from '@repo/domain'
import type { IngredientFormModalProps } from './types'

export const IngredientFormModal = ({
  ingredient,
  isSubmitting,
  onClose,
  onSubmit,
}: IngredientFormModalProps) => {
  const form = useForm<IngredientForm>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: { name: ingredient?.name ?? '', unit: ingredient?.unit ?? '' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })
  const [active, setActive] = useState(ingredient?.active ?? true)

  return (
    <FormModal
      open
      onClose={onClose}
      title={ingredient ? 'Editar ingrediente' : 'Nuevo ingrediente'}
      form={form}
      isSubmitting={isSubmitting}
      onSubmit={async (values) => {
        const input: IngredientInput = {
          name: values.name.trim(),
          unit: values.unit.trim(),
          active,
        }
        await onSubmit(input)
      }}
    >
      <FormField name="name" label="Nombre" required placeholder="Ej: Pan de hamburguesa" />
      <FormField name="unit" label="Unidad" required placeholder="Ej: un, kg, l" />
      <SwitchRow
        label="Activo"
        checked={active}
        onChange={setActive}
        ariaLabel="Ingrediente activo"
      />
    </FormModal>
  )
}
