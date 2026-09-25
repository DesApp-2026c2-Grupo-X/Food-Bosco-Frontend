import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import Car from '@gravity-ui/icons/Car'
import { FormProvider } from 'react-hook-form'
import { Card, FormActions, FormField, Muted, Strong } from '@repo/components'
import { useVehicleForm } from './hooks/useVehicleForm'

export const VehicleForm = () => {
  const {
    isLoading,
    form,
    type,
    isDirty,
    submitting,
    error,
    selectMoto,
    selectBici,
    onSave,
    onCancel,
  } = useVehicleForm()

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
              <FormField name="brand" label="Marca" required />
              <FormField name="model" label="Modelo" required />
              <FormField name="plate" label="Patente" required />
              {error ? (
                <Text color="danger" fontSize="sm">
                  {error}
                </Text>
              ) : null}
              <FormActions
                submitLabel="Guardar cambios"
                onCancel={onCancel}
                isSubmitting={submitting}
                disabled={!isDirty}
                cancelDisabled={!isDirty}
              />
            </>
          ) : (
            <Card variant="subtle">
              <Box color="brand.600" display="flex" marginBottom="2">
                <Car width={28} height={28} />
              </Box>
              <Strong>Bici</Strong>
              <Muted fontSize="sm" marginTop="1">
                No requiere marca, modelo ni patente. Tu elección se guarda automáticamente.
              </Muted>
            </Card>
          )}
        </VStack>
      </form>
    </FormProvider>
  )
}
