import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField, FormModal, SwitchRow } from '@repo/components'
import { categorySchema, type CategoryForm, type CategoryInput } from '@repo/domain'
import type { CategoryFormModalProps } from './types'

export const CategoryFormModal = ({
  category,
  isSubmitting,
  onClose,
  onSubmit,
}: CategoryFormModalProps) => {
  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: category?.name ?? '' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })
  const [active, setActive] = useState(category?.active ?? true)

  return (
    <FormModal
      open
      onClose={onClose}
      title={category ? 'Editar categoría' : 'Nueva categoría'}
      form={form}
      isSubmitting={isSubmitting}
      onSubmit={async (values) => {
        const input: CategoryInput = { name: values.name.trim(), active }
        await onSubmit(input)
      }}
    >
      <FormField name="name" label="Nombre" required placeholder="Ej: Hamburguesas" />
      <SwitchRow
        label="Activa"
        checked={active}
        onChange={setActive}
        ariaLabel="Categoría activa"
      />
    </FormModal>
  )
}
