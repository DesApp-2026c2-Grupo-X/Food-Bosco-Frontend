import { VStack } from '@chakra-ui/react'
import ChevronLeft from '@gravity-ui/icons/ChevronLeft'
import { FormProvider, type UseFormReturn } from 'react-hook-form'
import type { z } from 'zod'
import { addressSchema } from '@repo/domain'
import { FormField, GhostButton, PrimaryButton } from '@repo/components'

type AddressValues = z.infer<typeof addressSchema>

interface AddressFormProps {
  form: UseFormReturn<AddressValues>
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
  onBack?: () => void
}

export const AddressForm = ({ form, onSubmit, onBack }: AddressFormProps) => {
  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        <VStack gap="4" align="stretch">
          {onBack ? (
            <GhostButton
              size="sm"
              alignSelf="flex-start"
              paddingX="3"
              color="fg.muted"
              _hover={{ color: 'fg', bg: 'bg.muted' }}
              onClick={onBack}
            >
              <ChevronLeft width={16} height={16} />
              Volver
            </GhostButton>
          ) : null}

          <FormField name="label" label="Nombre" placeholder="Casa, Facultad, Trabajo…" />
          <FormField name="street" label="Calle y número" required placeholder="Av. Ejemplo 123" />
          <FormField name="city" label="Localidad" required placeholder="Hurlingham" />
          <FormField name="reference" label="Referencia" placeholder="Piso, depto, entre calles…" />

          <PrimaryButton
            type="submit"
            width="full"
            disabled={!form.formState.isValid}
            marginTop="2"
          >
            Guardar dirección
          </PrimaryButton>
        </VStack>
      </form>
    </FormProvider>
  )
}
