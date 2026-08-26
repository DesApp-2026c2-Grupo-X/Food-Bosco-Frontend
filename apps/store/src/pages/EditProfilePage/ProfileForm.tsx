import { HStack, VStack } from '@chakra-ui/react'
import { FormProvider } from 'react-hook-form'
import { FormField, GhostButton, PrimaryButton, TextField } from '@repo/components'
import { useProfileForm } from './hooks/useProfileForm'

interface ProfileFormProps {
  userId?: number
}

export const ProfileForm = ({ userId }: ProfileFormProps) => {
  const { user, isLoading, form, isDirty, onSave, onCancel } = useProfileForm({ userId })

  if (isLoading) return null

  return (
    <FormProvider {...form}>
      <form onSubmit={onSave}>
        <VStack align="stretch" gap="4">
          <FormField name="firstName" label="Nombre" required />
          <FormField name="lastName" label="Apellido" required />
          <TextField label="Correo electrónico" value={user?.email} readOnly color="fg.subtle" />
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
