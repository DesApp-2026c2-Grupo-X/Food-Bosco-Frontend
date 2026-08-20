import { Heading, HStack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  FormField,
  FormLayout,
  FormTextAreaField,
  PrimaryButton,
  ResponsiveModal,
  ToggleSwitch,
} from '@repo/components'
import { promotionSchema, type PromotionForm, type PromotionInput } from '@repo/domain'
import type { PromotionFormModalProps } from './types'

export const PromotionFormModal = ({
  promotion,
  isSubmitting,
  onClose,
  onSubmit,
}: PromotionFormModalProps) => {
  const form = useForm<PromotionForm>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      name: promotion?.name ?? '',
      description: promotion?.description ?? '',
      startDate: promotion?.startDate ?? '',
      endDate: promotion?.endDate ?? '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })
  const [active, setActive] = useState(promotion?.active ?? true)

  const handleSubmit = form.handleSubmit(async (values) => {
    const input: PromotionInput = {
      name: values.name.trim(),
      description: values.description?.trim() ?? '',
      startDate: values.startDate,
      endDate: values.endDate,
      active,
    }
    await onSubmit(input)
  })

  return (
    <ResponsiveModal open onClose={onClose}>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
          <Heading as="h2" fontSize="xl" fontWeight="bold" marginBottom="4">
            {promotion ? 'Editar promoción' : 'Nueva promoción'}
          </Heading>
          <FormLayout>
            <FormField name="name" label="Nombre" required placeholder="Ej: Promo invierno" />
            <FormTextAreaField
              name="description"
              label="Descripción"
              placeholder="Información general de la promoción"
            />
            <FormField name="startDate" label="Fecha de inicio" required type="date" />
            <FormField name="endDate" label="Fecha de fin" required type="date" />
            <HStack justify="space-between">
              <Text fontSize="sm" color="fg.muted">
                Activa
              </Text>
              <ToggleSwitch checked={active} onChange={setActive} ariaLabel="Promoción activa" />
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
