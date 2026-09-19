import { HStack, Text, VStack } from '@chakra-ui/react'
import GeoPin from '@gravity-ui/icons/GeoPin'
import {
  Card,
  GhostButton,
  InteractiveMap,
  Muted,
  PrimaryButton,
  Strong,
  type InteractiveMapMarker,
} from '@repo/components'
import type { AddressInput } from '@repo/domain'
import { MAP_MARKER_COLORS } from '@repo/theme'

interface AddressConfirmProps {
  input: AddressInput
  submitting: boolean
  error: string | null
  onConfirm: () => void
  onBack: () => void
}

export const AddressConfirm = ({
  input,
  submitting,
  error,
  onConfirm,
  onBack,
}: AddressConfirmProps) => {
  const center = { latitude: input.latitude, longitude: input.longitude }
  const markers: InteractiveMapMarker[] = [
    {
      latitude: input.latitude,
      longitude: input.longitude,
      color: MAP_MARKER_COLORS.client,
      label: 'A',
    },
  ]

  return (
    <VStack gap="4" align="stretch">
      <InteractiveMap
        center={center}
        markers={markers}
        zoom={16}
        height="220px"
        alt="Ubicación de la dirección"
      />

      <Card variant="subtle" borderRadius="xl" padding="4">
        <HStack gap="2" color="brand.600">
          <GeoPin width={16} height={16} />
          <Strong fontSize="sm">{input.label}</Strong>
        </HStack>
        <Muted fontSize="sm">{input.text}</Muted>
        <Muted fontSize="xs">
          {input.city}
          {input.postalCode ? ` · CP ${input.postalCode}` : ''}
        </Muted>
      </Card>

      {error ? (
        <Text color="danger" fontSize="sm">
          {error}
        </Text>
      ) : null}

      <PrimaryButton width="full" loading={submitting} onClick={onConfirm}>
        Confirmar dirección
      </PrimaryButton>
      <GhostButton width="full" onClick={onBack} disabled={submitting}>
        No es mi dirección
      </GhostButton>
    </VStack>
  )
}
