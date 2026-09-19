import { Box, Link as ChakraLink, Text, VStack } from '@chakra-ui/react'
import { FormProvider } from 'react-hook-form'
import {
  FormField,
  FormPasswordField,
  Muted,
  PageHeader,
  PrimaryButton,
  Strong,
  TextLink,
} from '@repo/components'
import { SegmentedChoice } from '../../components/SegmentedChoice'
import type { RegisterRole } from '../../authConfigContext'
import { useAuthConfig } from '../../authConfigContext'
import { authRoutes } from '../../routes'
import { useRegister } from './hooks/useRegister'

const VEHICLE_OPTIONS = [
  { value: 'moto', label: 'Moto' },
  { value: 'bici', label: 'Bici' },
]

export const RegisterPage = () => {
  const { form, role, vehicleType, submitting, error, onSubmit, registerRoles } = useRegister()
  const { riderUrl } = useAuthConfig()
  const showRoleSwitch = registerRoles.length > 1
  const roleOptions = registerRoles.map((registerRole) => ({
    value: registerRole,
    label: registerRole === 'customer' ? 'Cliente' : 'Repartidor',
  }))
  const riderRegisterUrl = riderUrl ? `${riderUrl.replace(/\/$/, '')}${authRoutes.register}` : null

  return (
    <VStack gap="8" align="stretch">
      <PageHeader title="Creá tu cuenta" description="Sumate y pedí en minutos." />

      <form onSubmit={onSubmit}>
        <FormProvider {...form}>
          <VStack gap="4" align="stretch">
            {showRoleSwitch ? (
              <SegmentedChoice
                value={role}
                onChange={(value) => form.setValue('role', value as RegisterRole)}
                options={roleOptions}
              />
            ) : null}

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
              <>
                <SegmentedChoice
                  value={vehicleType}
                  onChange={(value) => form.setValue('vehicleType', value as 'moto' | 'bici')}
                  options={VEHICLE_OPTIONS}
                />
                {vehicleType === 'moto' ? (
                  <>
                    <FormField name="brand" label="Marca" required placeholder="Honda" />
                    <FormField name="model" label="Modelo" required placeholder="CG 125" />
                    <FormField name="plate" label="Patente" required placeholder="AB 123 CD" />
                  </>
                ) : (
                  <Box
                    bg="bg.subtle"
                    border="1px solid"
                    borderColor="border.subtle"
                    borderRadius="2xl"
                    padding="4"
                  >
                    <Strong fontSize="sm">Bici</Strong>
                    <Muted fontSize="sm" marginTop="1">
                      No requiere marca, modelo ni patente.
                    </Muted>
                  </Box>
                )}
              </>
            ) : null}
            <FormPasswordField
              name="password"
              label="Contraseña"
              required
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
            />
            <FormPasswordField
              name="confirm"
              label="Repetir contraseña"
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
              Crear cuenta
            </PrimaryButton>
          </VStack>
        </FormProvider>
      </form>

      <Muted fontSize="sm" textAlign="center">
        ¿Ya tenés cuenta? <TextLink to={authRoutes.login}>Ingresá</TextLink>
      </Muted>

      {!registerRoles.includes('rider') && riderRegisterUrl ? (
        <Muted fontSize="sm" textAlign="center">
          ¿Sos repartidor?{' '}
          <ChakraLink href={riderRegisterUrl} color="brand.600" fontWeight="semibold">
            Registrate en la app de Rider
          </ChakraLink>
        </Muted>
      ) : null}
    </VStack>
  )
}
