import { Heading, HStack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField, FormLayout, PrimaryButton, ResponsiveModal, ToggleSwitch } from '@repo/components'
import {
  configOptionSchema,
  type ConfigOptionForm,
  type ConfigOptionInput,
} from '@repo/domain'
import type { ConfigOptionFormModalProps } from './types'

export const ConfigOptionFormModal = ({
  option,
  isSubmitting,
  onClose,
  onSubmit,
}: ConfigOptionFormModalProps) => {
  const form = useForm<ConfigOptionForm>({
    resolver: zodResolver(configOptionSchema),
    defaultValues: {
      name: option?.name ?? '',
      priceDelta: option ? String(option.priceDelta) : '0',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })
  const [active, setActive] = useState(option?.active ?? true)

  const handleSubmit = form.handleSubmit(async (values) => {
    const input: ConfigOptionInput = {
      name: values.name.trim(),
      priceDelta: Number(values.priceDelta),
      active,
    }
    await onSubmit(input)
  })

  return (
    <ResponsiveModal open onClose={onClose}>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
          <Heading as="h2" fontSize="xl" fontWeight="bold" marginBottom="4">
            {option ? 'Editar opción' : 'Nueva opción'}
          </Heading>
          <FormLayout>
            <FormField name="name" label="Nombre" required placeholder="Ej: Doble" />
            <FormField
              name="priceDelta"
              label="Variación de precio (+$)"
              required
              inputMode="decimal"
              placeholder="0"
            />
            <HStack justify="space-between">
              <Text fontSize="sm" color="fg.muted">
                Disponible
              </Text>
              <ToggleSwitch checked={active} onChange={setActive} ariaLabel="Opción disponible" />
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
