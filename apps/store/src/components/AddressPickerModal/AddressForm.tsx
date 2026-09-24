import { Text, VStack } from '@chakra-ui/react'
import { FormProvider, type UseFormReturn } from 'react-hook-form'
import type { z } from 'zod'
import { addressSchema } from '@repo/domain'
import { FormField, PrimaryButton } from '@repo/components'

type AddressValues = z.infer<typeof addressSchema>

interface AddressFormProps {
  form: UseFormReturn<AddressValues>
  submitting: boolean
  error: string | null
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
}

export const AddressForm = ({ form, submitting, error, onSubmit }: AddressFormProps) => {
  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
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
            Guardar dirección
          </PrimaryButton>
        </VStack>
      </form>
    </FormProvider>
  )
}
