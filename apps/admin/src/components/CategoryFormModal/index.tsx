import { Heading, HStack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  FormField,
  FormLayout,
  PrimaryButton,
  ResponsiveModal,
  ToggleSwitch,
} from '@repo/components'
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

  const handleSubmit = form.handleSubmit(async (values) => {
    const input: CategoryInput = { name: values.name.trim(), active }
    await onSubmit(input)
  })

  return (
    <ResponsiveModal open onClose={onClose}>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
          <Heading as="h2" fontSize="xl" fontWeight="bold" marginBottom="4">
            {category ? 'Editar categoría' : 'Nueva categoría'}
          </Heading>
          <FormLayout>
            <FormField name="name" label="Nombre" required placeholder="Ej: Hamburguesas" />
            <HStack justify="space-between">
              <Text fontSize="sm" color="fg.muted">
                Activa
              </Text>
              <ToggleSwitch checked={active} onChange={setActive} ariaLabel="Categoría activa" />
            </HStack>
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
