import { HStack, Text, VStack } from '@chakra-ui/react'
import { FormProvider } from 'react-hook-form'
import { useLocation } from 'react-router-dom'
import { APP_ROLE_MISMATCH_MESSAGE } from '@repo/domain'
import { FormField, FormPasswordField, PageHeader, PrimaryButton, TextLink } from '@repo/components'
import { useAuthConfig } from '../../authConfigContext'
import { authRoutes } from '../../routes'
import { useLogin } from './hooks/useLogin'

export const LoginPage = () => {
  const { form, submitting, error, onSubmit } = useLogin()
  const { showRegister } = useAuthConfig()
  const location = useLocation()
  const stateError = (location.state as { authError?: string } | null)?.authError
  const queryError = new URLSearchParams(location.search).get('authError')
  const authError = stateError ?? queryError
  const roleError = authError === 'APP_ROLE_MISMATCH' ? APP_ROLE_MISMATCH_MESSAGE : null

  return (
    <VStack gap="8" align="stretch">
      <PageHeader title="Ingresá a tu cuenta" description="Pedí desde tu campus favorito." />

      {roleError ? (
        <Text color="danger" fontSize="sm">
          {roleError}
        </Text>
      ) : null}

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
            <FormPasswordField
              name="password"
              label="Contraseña"
              required
              autoComplete="current-password"
              placeholder="Tu contraseña"
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
              Ingresar
            </PrimaryButton>
          </VStack>
        </FormProvider>
      </form>

      <HStack justify="space-between" fontSize="sm" flexWrap="wrap" gap="2">
        <TextLink to={authRoutes.forgotPassword}>Olvidé mi contraseña</TextLink>
        {showRegister === false ? null : <TextLink to={authRoutes.register}>Crear cuenta</TextLink>}
      </HStack>
    </VStack>
  )
}
