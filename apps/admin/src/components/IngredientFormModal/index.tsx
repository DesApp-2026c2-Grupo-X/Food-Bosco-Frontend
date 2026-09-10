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

  const handleSubmit = form.handleSubmit(async (values) => {
    const input: IngredientInput = {
      name: values.name.trim(),
      unit: values.unit.trim(),
      active,
    }
    await onSubmit(input)
  })

  return (
    <ResponsiveModal open onClose={onClose}>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
          <Heading as="h2" fontSize="xl" fontWeight="bold" marginBottom="4">
            {ingredient ? 'Editar ingrediente' : 'Nuevo ingrediente'}
          </Heading>
          <FormLayout>
            <FormField name="name" label="Nombre" required placeholder="Ej: Pan de hamburguesa" />
            <FormField name="unit" label="Unidad" required placeholder="Ej: un, kg, l" />
            <HStack justify="space-between">
              <Text fontSize="sm" color="fg.muted">
                Activo
              </Text>
              <ToggleSwitch checked={active} onChange={setActive} ariaLabel="Ingrediente activo" />
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
