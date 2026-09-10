import { Box, Button, Heading, VStack } from '@chakra-ui/react'
import ChevronLeft from '@gravity-ui/icons/ChevronLeft'
import ChevronRight from '@gravity-ui/icons/ChevronRight'
import GeoPin from '@gravity-ui/icons/GeoPin'
import Plus from '@gravity-ui/icons/Plus'
import { GhostButton, Muted, Strong, Subtle } from '@repo/components'
import { AddressForm } from './AddressForm'
import { AddressMapPreview } from './AddressMapPreview'
import type { UseAddressPickerReturn } from './hooks/useAddressPicker'

type AddressPickerContentProps = UseAddressPickerReturn

export const AddressPickerContent = (props: AddressPickerContentProps) => {
  const {
    addresses,
    step,
    form,
    pending,
    submitting,
    error,
    handleSelect,
    handleSubmitForm,
    handleConfirm,
    openForm,
    backToForm,
    backToList,
  } = props

  const hasSavedAddresses = addresses.length > 0

  const title =
    step === 'form'
      ? 'Cargá tu dirección'
      : step === 'confirm'
        ? '¿Es esta tu dirección?'
        : '¿A dónde te lo llevamos?'

  const description =
    step === 'form'
      ? 'Necesitamos tu dirección para mostrarte qué productos llegan a tu zona.'
      : step === 'confirm'
        ? 'Confirmá que el punto en el mapa coincida con la realidad.'
        : 'Elegí una dirección para ver qué productos están disponibles en tu zona.'

  const showBack = step !== 'list' && hasSavedAddresses
  const onBack = step === 'confirm' ? backToForm : backToList

  return (
    <Box>
      <VStack align="start" gap="1" marginBottom="5">
        {showBack ? (
          <GhostButton
            size="sm"
            width="11"
            height="11"
            minWidth="0"
            padding="0"
            bg="bg.muted"
            color="brand.600"
            _hover={{ color: 'brand.700', bg: 'bg.muted' }}
            marginBottom="1"
            aria-label="Volver"
            onClick={onBack}
          >
            <ChevronLeft width={22} height={22} />
          </GhostButton>
        ) : (
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
        )}
        <Heading as="h2" fontSize="xl" fontWeight="bold">
          {title}
        </Heading>
        <Muted fontSize="sm">{description}</Muted>
      </VStack>

      {step === 'form' ? (
        <AddressForm
          form={form}
          submitting={submitting}
          error={error}
          onSubmit={handleSubmitForm}
        />
      ) : step === 'confirm' && pending ? (
        <AddressMapPreview
          input={pending}
          submitting={submitting}
          error={error}
          onConfirm={handleConfirm}
          onBack={backToForm}
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
                  {address.text}
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
