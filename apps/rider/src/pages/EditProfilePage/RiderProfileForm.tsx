import { HStack, VStack } from '@chakra-ui/react'
import { FormProvider } from 'react-hook-form'
import { FormField, GhostButton, PrimaryButton, TextField } from '@repo/components'
import { useRiderProfileForm } from './hooks/useRiderProfileForm'

export const RiderProfileForm = () => {
  const { user, isLoading, form, isDirty, onSave, onCancel } = useRiderProfileForm()

  if (isLoading) return null

  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()

  return (
    <FormProvider {...form}>
      <form onSubmit={onSave}>
        <VStack align="stretch" gap="4">
          <TextField label="Nombre" value={fullName || 'Sin nombre'} readOnly color="fg.subtle" />
          <FormField name="phone" label="Teléfono" required />
          <HStack gap="2" marginTop="2">
            <PrimaryButton type="submit" flex="1" disabled={!isDirty}>
              Guardar cambios
            </PrimaryButton>
            <GhostButton onClick={onCancel} disabled={!isDirty}>
              Cancelar
            </GhostButton>
          </HStack>
        </VStack>
      </form>
    </FormProvider>
  )
}
