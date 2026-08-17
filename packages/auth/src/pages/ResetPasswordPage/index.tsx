import { VStack } from '@chakra-ui/react'
import { FormProvider } from 'react-hook-form'
import { FormPasswordField, PrimaryButton } from '@repo/components'
import { AuthSuccess } from '../../components/AuthSuccess'
import { PageHeader } from '../../components/PageHeader'
import { authRoutes } from '../../routes'
import { useResetPassword } from './hooks/useResetPassword'

export const ResetPasswordPage = () => {
  const { form, submitting, done, onSubmit } = useResetPassword()

  if (done) {
    return (
      <AuthSuccess
        title="Contraseña restablecida"
        description="Ya podés ingresar con tu nueva contraseña."
        buttonLabel="Ir al login"
        to={authRoutes.login}
      />
    )
  }

  return (
    <VStack gap="8" align="stretch">
      <PageHeader
        title="Restablecé tu contraseña"
        description="Elegí una nueva contraseña para tu cuenta."
      />

      <form onSubmit={onSubmit}>
        <FormProvider {...form}>
          <VStack gap="4" align="stretch">
            <FormPasswordField
              name="password"
              label="Nueva contraseña"
              required
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
            />
            <FormPasswordField
              name="confirm"
              label="Repetir contraseña"
              required
              autoComplete="new-password"
              placeholder="Repetí tu contraseña"
            />
            <PrimaryButton
              type="submit"
              disabled={!form.formState.isValid || submitting}
              loading={submitting}
              marginTop="2"
            >
              Restablecer contraseña
            </PrimaryButton>
          </VStack>
        </FormProvider>
      </form>
    </VStack>
  )
}
