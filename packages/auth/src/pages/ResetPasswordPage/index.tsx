import { Text, VStack } from '@chakra-ui/react'
import { FormProvider } from 'react-hook-form'
import { FormPasswordField, PageHeader, PrimaryButton } from '@repo/components'
import { AuthNotice } from '../../components/AuthNotice'
import { AuthSuccess } from '../../components/AuthSuccess'
import { authRoutes } from '../../routes'
import { useResetPassword } from './hooks/useResetPassword'

export const ResetPasswordPage = () => {
  const { form, submitting, done, invalidToken, hasToken, error, onSubmit } = useResetPassword()

  if (!hasToken || invalidToken) {
    return (
      <AuthNotice
        title="Enlace no válido"
        description={
          invalidToken
            ? 'El enlace de recuperación no es válido o ya expiró. Solicitá un nuevo enlace para continuar.'
            : 'El enlace de recuperación no es válido.'
        }
        primaryLabel="Solicitar nuevo enlace"
        primaryTo={authRoutes.forgotPassword}
        secondaryLabel="Volver al login"
        secondaryTo={authRoutes.login}
      />
    )
  }

  if (done) {
    return (
      <AuthSuccess
        title="Contraseña actualizada correctamente"
        description="Ya podés iniciar sesión con tu nueva contraseña."
        buttonLabel="Iniciar sesión"
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
              placeholder="Mínimo 8 caracteres"
            />
            <FormPasswordField
              name="confirm"
              label="Confirmar contraseña"
              required
              autoComplete="new-password"
              placeholder="Repetí tu contraseña"
            />
            {error ? (
              <Text color="danger" fontSize="sm">
                {error}
              </Text>
            ) : null}
            <PrimaryButton
              type="submit"
              disabled={!form.formState.isValid || submitting}
              loading={submitting}
              marginTop="2"
            >
              {submitting ? 'Actualizando contraseña...' : 'Cambiar contraseña'}
            </PrimaryButton>
          </VStack>
        </FormProvider>
      </form>
    </VStack>
  )
}
