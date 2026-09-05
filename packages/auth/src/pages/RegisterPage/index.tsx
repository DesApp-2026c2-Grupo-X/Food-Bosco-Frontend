import { Button, HStack, VStack } from '@chakra-ui/react'
import { FormProvider } from 'react-hook-form'
import { FormField, FormPasswordField, Muted, PrimaryButton, TextLink } from '@repo/components'
import { PageHeader } from '../../components/PageHeader'
import { authRoutes } from '../../routes'
import { useRegister } from './hooks/useRegister'

export const RegisterPage = () => {
  const { form, role, submitting, onSubmit } = useRegister()

  return (
    <VStack gap="8" align="stretch">
      <PageHeader title="Creá tu cuenta" description="Sumate y pedí en minutos." />

      <form onSubmit={onSubmit}>
        <FormProvider {...form}>
          <VStack gap="4" align="stretch">
            <HStack gap="2">
              <Button
                type="button"
                flex="1"
                variant={role === 'customer' ? 'solid' : 'outline'}
                bg={role === 'customer' ? 'brand.500' : 'transparent'}
                color={role === 'customer' ? 'white' : 'fg.muted'}
                borderColor="border.emphasized"
                borderRadius="full"
                onClick={() => form.setValue('role', 'customer')}
              >
                Cliente
              </Button>
              <Button
                type="button"
                flex="1"
                variant={role === 'rider' ? 'solid' : 'outline'}
                bg={role === 'rider' ? 'brand.500' : 'transparent'}
                color={role === 'rider' ? 'white' : 'fg.muted'}
                borderColor="border.emphasized"
                borderRadius="full"
                onClick={() => form.setValue('role', 'rider')}
              >
                Repartidor
              </Button>
            </HStack>

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
            {role === 'rider' ? (
              <FormField name="vehicle" label="Vehículo" required placeholder="Moto · HLP 482" />
            ) : null}
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
        ¿Ya tenés cuenta? <TextLink to={authRoutes.login}>Ingresá</TextLink>
      </Muted>
    </VStack>
  )
}
