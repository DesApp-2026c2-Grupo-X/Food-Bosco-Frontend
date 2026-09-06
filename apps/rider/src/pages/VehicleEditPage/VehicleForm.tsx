import { Box, Button, HStack, VStack } from '@chakra-ui/react'
import Car from '@gravity-ui/icons/Car'
import { FormProvider } from 'react-hook-form'
import { FormField, GhostButton, Muted, PrimaryButton, Strong } from '@repo/components'
import { useVehicleForm } from './hooks/useVehicleForm'

export const VehicleForm = () => {
  const { isLoading, form, type, isDirty, selectMoto, selectBici, onSave, onCancel } =
    useVehicleForm()

  if (isLoading) return null

  return (
    <FormProvider {...form}>
      <form onSubmit={onSave}>
        <VStack align="stretch" gap="4">
          <HStack gap="2">
            <Button
              type="button"
              flex="1"
              variant={type === 'moto' ? 'solid' : 'outline'}
              bg={type === 'moto' ? 'brand.500' : 'transparent'}
              color={type === 'moto' ? 'white' : 'fg.muted'}
              borderColor="border.emphasized"
              borderRadius="full"
              onClick={selectMoto}
            >
              Moto
            </Button>
            <Button
              type="button"
              flex="1"
              variant={type === 'bici' ? 'solid' : 'outline'}
              bg={type === 'bici' ? 'brand.500' : 'transparent'}
              color={type === 'bici' ? 'white' : 'fg.muted'}
              borderColor="border.emphasized"
              borderRadius="full"
              onClick={selectBici}
            >
              Bici
            </Button>
          </HStack>

          {type === 'moto' ? (
            <>
              <FormField name="marca" label="Marca" required />
              <FormField name="modelo" label="Modelo" required />
              <FormField name="patente" label="Patente" required />
              <HStack gap="2" marginTop="2">
                <PrimaryButton type="submit" flex="1" disabled={!isDirty}>
                  Guardar cambios
                </PrimaryButton>
                <GhostButton onClick={onCancel} disabled={!isDirty}>
                  Cancelar
                </GhostButton>
              </HStack>
            </>
          ) : (
            <Box
              bg="bg.subtle"
              border="1px solid"
              borderColor="border.subtle"
              borderRadius="2xl"
              padding="5"
            >
              <Box color="brand.600" display="flex" marginBottom="2">
                <Car width={28} height={28} />
              </Box>
              <Strong>Bici</Strong>
              <Muted fontSize="sm" marginTop="1">
                No requiere marca, modelo ni patente. Tu elección se guarda automáticamente.
              </Muted>
            </Box>
          )}
        </VStack>
      </form>
    </FormProvider>
  )
}
