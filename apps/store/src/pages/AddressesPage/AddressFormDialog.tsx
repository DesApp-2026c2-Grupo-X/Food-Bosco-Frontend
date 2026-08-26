import { Heading, Text, VStack } from '@chakra-ui/react'
import { FormProvider, type UseFormReturn } from 'react-hook-form'
import type { z } from 'zod'
import { addressSchema } from '@repo/domain'
import { FormField, PrimaryButton, ResponsiveModal } from '@repo/components'

type AddressValues = z.infer<typeof addressSchema>

interface AddressFormDialogProps {
  open: boolean
  editing: boolean
  submitting: boolean
  error: string | null
  form: UseFormReturn<AddressValues>
  onClose: () => void
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
}

export const AddressFormDialog = ({
  open,
  editing,
  submitting,
  error,
  form,
  onClose,
  onSubmit,
}: AddressFormDialogProps) => {
  return (
    <ResponsiveModal open={open} onClose={onClose}>
      <FormProvider {...form}>
        <form onSubmit={onSubmit}>
          <Heading as="h2" fontSize="xl" fontWeight="bold" marginBottom="4">
            {editing ? 'Editar dirección' : 'Agregar dirección'}
          </Heading>
          <VStack gap="4" align="stretch">
            <FormField name="label" label="Nombre" placeholder="Casa, Facultad, Trabajo…" />
            <FormField name="text" label="Calle y número" required placeholder="Av. Ejemplo 123" />
            <FormField name="city" label="Localidad" required placeholder="Hurlingham" />
            <FormField name="postalCode" label="Código postal" required placeholder="1686" />
            {error ? (
              <Text color="danger" fontSize="sm">
                {error}
              </Text>
            ) : null}
            <PrimaryButton
              type="submit"
              width="full"
              disabled={!form.formState.isValid || submitting}
              loading={submitting}
              marginTop="2"
            >
              Guardar
            </PrimaryButton>
          </VStack>
        </form>
      </FormProvider>
    </ResponsiveModal>
  )
}
