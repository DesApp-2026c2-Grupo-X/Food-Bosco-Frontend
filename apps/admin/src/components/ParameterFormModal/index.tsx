import { Heading, Text } from '@chakra-ui/react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField, FormLayout, PrimaryButton, ResponsiveModal } from '@repo/components'
import { parameterSchema, type ParameterForm } from '@repo/domain'
import type { ParameterFormModalProps } from './types'

export const ParameterFormModal = ({
  parameter,
  isSubmitting,
  onClose,
  onSubmit,
}: ParameterFormModalProps) => {
  const form = useForm<ParameterForm>({
    resolver: zodResolver(parameterSchema),
    defaultValues: { value: parameter ? String(parameter.value) : '' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(Number(values.value))
  })

  return (
    <ResponsiveModal open onClose={onClose}>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
          <Heading as="h2" fontSize="xl" fontWeight="bold" marginBottom="2">
            Editar parámetro
          </Heading>
          {parameter ? (
            <Text fontSize="sm" color="fg.muted" marginBottom="4">
              {parameter.key} · {parameter.unit}
            </Text>
          ) : null}
          <FormLayout>
            <FormField
              name="value"
              label="Valor"
              required
              inputMode="decimal"
              placeholder="Ej: 10"
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
