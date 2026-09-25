import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField, FormModal, FormSelectField, SwitchRow } from '@repo/components'
import {
  configGroupSchema,
  type ConfigGroupForm,
  type ConfigGroupInput,
  type ProductConfigGroup,
} from '@repo/domain'
import type { ConfigGroupFormModalProps } from './types'

const TYPE_OPTIONS = [
  { value: 'single', label: 'Selección única' },
  { value: 'multiple', label: 'Selección múltiple' },
]

export const ConfigGroupFormModal = ({
  group,
  isSubmitting,
  onClose,
  onSubmit,
}: ConfigGroupFormModalProps) => {
  const form = useForm<ConfigGroupForm>({
    resolver: zodResolver(configGroupSchema),
    defaultValues: {
      name: group?.name ?? '',
      type: group?.type ?? 'single',
      min: group?.min != null ? String(group.min) : '0',
      max: group?.max != null ? String(group.max) : '1',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })
  const [required, setRequired] = useState(group?.required ?? false)

  return (
    <FormModal
      open
      onClose={onClose}
      title={group ? 'Editar grupo' : 'Nuevo grupo'}
      form={form}
      isSubmitting={isSubmitting}
      onSubmit={async (values) => {
        const input: ConfigGroupInput = {
          name: values.name.trim(),
          type: values.type as ProductConfigGroup['type'],
          required,
          min: Number(values.min),
          max: Number(values.max),
        }
        await onSubmit(input)
      }}
    >
      <FormField name="name" label="Nombre" required placeholder="Ej: Tamaño" />
      <FormSelectField name="type" label="Tipo de selección" required options={TYPE_OPTIONS} />
      <SwitchRow
        label="Obligatorio"
        checked={required}
        onChange={setRequired}
        ariaLabel="Grupo obligatorio"
      />
      <FormField name="min" label="Mínimo" required inputMode="numeric" placeholder="0" />
      <FormField name="max" label="Máximo" required inputMode="numeric" placeholder="1" />
    </FormModal>
  )
}
