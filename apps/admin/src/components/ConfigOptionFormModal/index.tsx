import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField, FormModal, SwitchRow } from '@repo/components'
import { configOptionSchema, type ConfigOptionForm, type ConfigOptionInput } from '@repo/domain'
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
      extraPrice: option ? String(option.extraPrice) : '0',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })
  const [available, setAvailable] = useState(option?.available ?? true)

  return (
    <FormModal
      open
      onClose={onClose}
      title={option ? 'Editar opción' : 'Nueva opción'}
      form={form}
      isSubmitting={isSubmitting}
      onSubmit={async (values) => {
        const input: ConfigOptionInput = {
          name: values.name.trim(),
          extraPrice: Number(values.extraPrice),
          available,
        }
        await onSubmit(input)
      }}
    >
      <FormField name="name" label="Nombre" required placeholder="Ej: Doble" />
      <FormField
        name="extraPrice"
        label="Variación de precio"
        required
        inputMode="decimal"
        placeholder="0"
      />
      <SwitchRow
        label="Disponible"
        checked={available}
        onChange={setAvailable}
        ariaLabel="Opción disponible"
      />
    </FormModal>
  )
}
