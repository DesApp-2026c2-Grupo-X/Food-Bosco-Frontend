import { Text } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField, FormModal } from '@repo/components'
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

  return (
    <FormModal
      open
      onClose={onClose}
      title="Editar parámetro"
      headingMarginBottom="2"
      subtitle={
        parameter ? (
          <Text fontSize="sm" color="fg.muted" marginBottom="4">
            {parameter.key} · {parameter.unit}
          </Text>
        ) : null
      }
      form={form}
      isSubmitting={isSubmitting}
      onSubmit={async (values) => {
        await onSubmit(Number(values.value))
      }}
    >
      <FormField name="value" label="Valor" required inputMode="decimal" placeholder="Ej: 10" />
    </FormModal>
  )
}
