import { Box, Button, Heading, VStack } from '@chakra-ui/react'
import ChevronRight from '@gravity-ui/icons/ChevronRight'
import GeoPin from '@gravity-ui/icons/GeoPin'
import Plus from '@gravity-ui/icons/Plus'
import { GhostButton, Muted, Strong, Subtle } from '@repo/components'
import { AddressForm } from './AddressForm'
import type { UseAddressPickerReturn } from './hooks/useAddressPicker'

type AddressPickerContentProps = UseAddressPickerReturn

export const AddressPickerContent = (props: AddressPickerContentProps) => {
  const { addresses, showForm, form, handleSelect, handleAdd, openForm, closeForm } = props

  const hasSavedAddresses = addresses.length > 0

  return (
    <Box>
      <VStack align="start" gap="1" marginBottom="5">
        <Box
          color="brand.600"
          bg="bg.muted"
          borderRadius="full"
          width="11"
          height="11"
          display="flex"
          alignItems="center"
          justifyContent="center"
          marginBottom="1"
        >
          <GeoPin width={22} height={22} />
        </Box>
        <Heading as="h2" fontSize="xl" fontWeight="bold">
          {showForm ? 'Cargá tu dirección' : '¿A dónde te lo llevamos?'}
        </Heading>
        <Muted fontSize="sm">
          {showForm
            ? 'Contanos dónde estás para llevarte el pedido.'
            : 'Elegí una de tus direcciones guardadas.'}
        </Muted>
      </VStack>

      {showForm ? (
        <AddressForm
          form={form}
          onSubmit={handleAdd}
          onBack={hasSavedAddresses ? closeForm : undefined}
        />
      ) : (
        <VStack gap="2" align="stretch">
          {addresses.map((address) => (
            <Button
              key={address.id}
              variant="outline"
              width="full"
              height="auto"
              justifyContent="flex-start"
              textAlign="left"
              borderColor="border.subtle"
              borderRadius="xl"
              paddingX="4"
              paddingY="3.5"
              gap="3"
              _hover={{ borderColor: 'border.emphasized', bg: 'bg.muted' }}
              onClick={() => handleSelect(address.id)}
            >
              <Box flex="1" minWidth="0">
                <Strong>{address.label}</Strong>
                <Muted fontSize="sm" lineClamp={1}>
                  {address.street}
                </Muted>
                <Subtle fontSize="xs">{address.city}</Subtle>
              </Box>
              <Box color="fg.subtle" display="flex">
                <ChevronRight width={18} height={18} />
              </Box>
            </Button>
          ))}

          <GhostButton
            width="full"
            borderRadius="xl"
            paddingY="3.5"
            color="brand.600"
            onClick={openForm}
          >
            <Plus width={16} height={16} />
            Agregar nueva dirección
          </GhostButton>
        </VStack>
      )}
    </Box>
  )
}
