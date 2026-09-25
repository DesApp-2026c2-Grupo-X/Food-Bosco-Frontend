import { Text, VStack } from '@chakra-ui/react'
import { FormProvider } from 'react-hook-form'
import { FormActions, FormField, TextField } from '@repo/components'
import { useProfileForm } from './hooks/useProfileForm'

export const ProfileForm = () => {
  const { user, isLoading, form, isDirty, submitting, error, onSave, onCancel } = useProfileForm()

  if (isLoading) return null

  return (
    <FormProvider {...form}>
      <form onSubmit={onSave}>
        <VStack align="stretch" gap="4">
          <FormField name="firstName" label="Nombre" required />
          <FormField name="lastName" label="Apellido" required />
          <TextField label="Correo electrónico" value={user?.email} readOnly color="fg.subtle" />
          <FormField name="phone" label="Teléfono" required />
          {error ? (
            <Text color="danger" fontSize="sm">
              {error}
            </Text>
          ) : null}
          <FormActions
            submitLabel="Guardar cambios"
            onCancel={onCancel}
            isSubmitting={submitting}
            disabled={!isDirty}
            cancelDisabled={!isDirty}
          />
        </VStack>
      </form>
    </FormProvider>
  )
}
