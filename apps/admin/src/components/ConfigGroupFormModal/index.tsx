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
import { FormSelectField } from '../FormSelectField'
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
      min: group ? String(group.min) : '0',
      max: group ? String(group.max) : '1',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })
  const [required, setRequired] = useState(group?.required ?? false)

  const handleSubmit = form.handleSubmit(async (values) => {
    const input: ConfigGroupInput = {
      name: values.name.trim(),
      type: values.type as ProductConfigGroup['type'],
      required,
      min: Number(values.min),
      max: Number(values.max),
    }
    await onSubmit(input)
  })

  return (
    <ResponsiveModal open onClose={onClose}>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
          <Heading as="h2" fontSize="xl" fontWeight="bold" marginBottom="4">
            {group ? 'Editar grupo' : 'Nuevo grupo'}
          </Heading>
          <FormLayout>
            <FormField name="name" label="Nombre" required placeholder="Ej: Tamaño" />
            <FormSelectField
              name="type"
              label="Tipo de selección"
              required
              options={TYPE_OPTIONS}
            />
            <HStack justify="space-between">
              <Text fontSize="sm" color="fg.muted">
                Obligatorio
              </Text>
              <ToggleSwitch
                checked={required}
                onChange={setRequired}
                ariaLabel="Grupo obligatorio"
              />
            </HStack>
            <FormField name="min" label="Mínimo" required inputMode="numeric" placeholder="0" />
            <FormField name="max" label="Máximo" required inputMode="numeric" placeholder="1" />
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
