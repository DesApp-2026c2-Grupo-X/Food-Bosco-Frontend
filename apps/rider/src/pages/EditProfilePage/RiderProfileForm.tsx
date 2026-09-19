import { Text, VStack } from '@chakra-ui/react'
import { FormProvider } from 'react-hook-form'
import { FormActions, FormField, TextField } from '@repo/components'
import { useRiderProfileForm } from './hooks/useRiderProfileForm'

export const RiderProfileForm = () => {
  const { user, isLoading, form, isDirty, submitting, error, onSave, onCancel } =
    useRiderProfileForm()

  if (isLoading) return null

  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()

  return (
    <FormProvider {...form}>
      <form onSubmit={onSave}>
        <VStack align="stretch" gap="4">
          <TextField label="Nombre" value={fullName || 'Sin nombre'} readOnly color="fg.subtle" />
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
