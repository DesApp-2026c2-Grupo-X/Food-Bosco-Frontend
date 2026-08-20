import { Heading, HStack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField, FormLayout, PrimaryButton, ResponsiveModal, ToggleSwitch } from '@repo/components'
import { orderStateSchema, type OrderStateForm, type OrderStateInput } from '@repo/domain'
import type { OrderStateFormModalProps } from './types'

export const OrderStateFormModal = ({
  state,
  isSubmitting,
  onClose,
  onSubmit,
}: OrderStateFormModalProps) => {
  const form = useForm<OrderStateForm>({
    resolver: zodResolver(orderStateSchema),
    defaultValues: { name: state?.name ?? '', order: state ? String(state.order) : '' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })
  const [active, setActive] = useState(state?.active ?? true)

  const handleSubmit = form.handleSubmit(async (values) => {
    const input: OrderStateInput = {
      name: values.name.trim(),
      order: Number(values.order),
      active,
    }
    await onSubmit(input)
  })

  return (
    <ResponsiveModal open onClose={onClose}>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
          <Heading as="h2" fontSize="xl" fontWeight="bold" marginBottom="4">
            {state ? 'Editar estado' : 'Nuevo estado'}
          </Heading>
          {state ? (
            <Text fontSize="sm" color="fg.muted" marginBottom="4">
              Código: {state.code}
            </Text>
          ) : null}
          <FormLayout>
            <FormField name="name" label="Nombre visible" required placeholder="Ej: Pendiente" />
            <FormField name="order" label="Orden" required inputMode="numeric" placeholder="Ej: 1" />
            <HStack justify="space-between">
              <Text fontSize="sm" color="fg.muted">
                Activo
              </Text>
              <ToggleSwitch checked={active} onChange={setActive} ariaLabel="Estado activo" />
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
