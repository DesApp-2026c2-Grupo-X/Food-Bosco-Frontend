import { VStack } from '@chakra-ui/react'
import { FormProvider } from 'react-hook-form'
import { FormField, FormPasswordField, Muted, PrimaryButton, TextLink } from '@repo/components'
import { PageHeader } from '../../components/PageHeader'
import { routes } from '../../routes'
import { useRegister } from './hooks/useRegister'

export const RegisterPage = () => {
  const { form, submitting, onSubmit } = useRegister()

  return (
    <VStack gap="8" align="stretch">
      <PageHeader title="Creá tu cuenta" description="Sumate y pedí en minutos." />

      <form onSubmit={onSubmit}>
        <FormProvider {...form}>
          <VStack gap="4" align="stretch">
            <FormField
              name="firstName"
              label="Nombre"
              required
              autoComplete="given-name"
              placeholder="Juan"
            />
            <FormField
              name="lastName"
              label="Apellido"
              required
              autoComplete="family-name"
              placeholder="Pérez"
            />
            <FormField
              name="email"
              label="Email"
              required
              type="email"
              autoComplete="email"
              placeholder="juan.perez@unahur.edu.ar"
            />
            <FormField
              name="phone"
              label="Teléfono"
              required
              type="tel"
              autoComplete="tel"
              placeholder="+54 11 5555-1234"
            />
            <FormPasswordField
              name="password"
              label="Contraseña"
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
              Crear cuenta
            </PrimaryButton>
          </VStack>
        </FormProvider>
      </form>

      <Muted fontSize="sm" textAlign="center">
        ¿Ya tenés cuenta? <TextLink to={routes.login}>Ingresá</TextLink>
      </Muted>
    </VStack>
  )
}
