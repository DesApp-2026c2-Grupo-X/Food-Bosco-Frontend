import { HStack, Text, VStack } from '@chakra-ui/react'
import { FormProvider } from 'react-hook-form'
import { FormField, FormPasswordField, PrimaryButton, TextLink } from '@repo/components'
import { PageHeader } from '../../components/PageHeader'
import { authRoutes } from '../../routes'
import { useLogin } from './hooks/useLogin'

export const LoginPage = () => {
  const { form, submitting, error, onSubmit } = useLogin()

  return (
    <VStack gap="8" align="stretch">
      <PageHeader title="Ingresá a tu cuenta" description="Pedí desde tu campus favorito." />

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
              placeholder="Mínimo 6 caracteres"
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
        <TextLink to={authRoutes.register}>Crear cuenta</TextLink>
      </HStack>
    </VStack>
  )
}
