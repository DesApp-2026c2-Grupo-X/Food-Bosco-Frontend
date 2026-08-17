import { VStack } from '@chakra-ui/react'
import { FormProvider } from 'react-hook-form'
import { FormField, Muted, PrimaryButton, TextLink } from '@repo/components'
import { AuthSuccess } from '../../components/AuthSuccess'
import { PageHeader } from '../../components/PageHeader'
import { routes } from '../../routes'
import { useForgotPassword } from './hooks/useForgotPassword'

export const ForgotPasswordPage = () => {
  const { form, submitting, sent, onSubmit } = useForgotPassword()

  if (sent) {
    return (
      <AuthSuccess
        title="Revisá tu email"
        description={`Te enviamos un enlace para restablecer tu contraseña a ${form.getValues('email')}.`}
        buttonLabel="Volver al login"
        to={routes.login}
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
            <PrimaryButton
              type="submit"
              disabled={!form.formState.isValid || submitting}
              loading={submitting}
              marginTop="2"
            >
              Enviar instrucciones
            </PrimaryButton>
          </VStack>
        </FormProvider>
      </form>

      <Muted fontSize="sm" textAlign="center">
        <TextLink to={routes.login}>Volver al login</TextLink>
      </Muted>
    </VStack>
  )
}
