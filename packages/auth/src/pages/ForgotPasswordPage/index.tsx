import { Text, VStack } from '@chakra-ui/react'
import { FormProvider } from 'react-hook-form'
import { FormField, Muted, PageHeader, PrimaryButton, TextLink } from '@repo/components'
import { AuthSuccess } from '../../components/AuthSuccess'
import { authRoutes } from '../../routes'
import { useForgotPassword } from './hooks/useForgotPassword'

export const ForgotPasswordPage = () => {
  const { form, submitting, sent, error, onSubmit } = useForgotPassword()

  if (sent) {
    return (
      <AuthSuccess
        title="Revisá tu email"
        description="Si existe una cuenta asociada a ese email, recibirás un correo con las instrucciones para restablecer tu contraseña."
        buttonLabel="Volver al login"
        to={authRoutes.login}
      />
    )
  }

  return (
    <VStack gap="8" align="stretch">
      <PageHeader
        title="Recuperá tu contraseña"
        description="Ingresá tu email y te enviamos un enlace para restablecerla."
      />

      <form onSubmit={onSubmit}>
        <FormProvider {...form}>
          <VStack gap="4" align="stretch">
            <FormField
              name="email"
              label="Email"
              required
              type="email"
              autoComplete="email"
              placeholder="juan.perez@unahur.edu.ar"
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
              {submitting ? 'Enviando...' : 'Enviar instrucciones'}
            </PrimaryButton>
          </VStack>
        </FormProvider>
      </form>

      <Muted fontSize="sm" textAlign="center">
        <TextLink to={authRoutes.login}>Volver al login</TextLink>
      </Muted>
    </VStack>
  )
}
