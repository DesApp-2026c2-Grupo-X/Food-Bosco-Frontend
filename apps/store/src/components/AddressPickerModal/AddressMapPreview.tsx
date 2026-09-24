import { Box, HStack, Image, Spinner, Text, VStack } from '@chakra-ui/react'
import GeoPin from '@gravity-ui/icons/GeoPin'
import { useState } from 'react'
import { GhostButton, Muted, PrimaryButton, Strong } from '@repo/components'
import type { AddressInput } from '@repo/domain'
import { buildStaticMapUrl } from '../../utils/geoapify'

interface AddressMapPreviewProps {
  input: AddressInput
  submitting: boolean
  error: string | null
  onConfirm: () => void
  onBack: () => void
}

export const AddressMapPreview = ({
  input,
  submitting,
  error,
  onConfirm,
  onBack,
}: AddressMapPreviewProps) => {
  const [loaded, setLoaded] = useState(false)

  const mapUrl = buildStaticMapUrl({
    markers: [{ lat: input.latitude, lon: input.longitude, color: '#ea580c', icon: 'pin' }],
    centerLat: input.latitude,
    centerLon: input.longitude,
    zoom: 16,
    width: 640,
    height: 360,
  })

  return (
    <VStack gap="4" align="stretch">
      <Box
        position="relative"
        aspectRatio="16 / 9"
        borderRadius="xl"
        overflow="hidden"
        border="1px solid"
        borderColor="border.subtle"
        bg="bg.muted"
      >
        <Image
          src={mapUrl}
          alt="Ubicación de la dirección"
          position="absolute"
          inset="0"
          width="100%"
          height="100%"
          objectFit="cover"
          opacity={loaded ? 1 : 0}
          transition="opacity 0.25s"
          onLoad={() => setLoaded(true)}
        />
        {loaded ? null : (
          <Box
            position="absolute"
            inset="0"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Spinner color="brand.600" />
          </Box>
        )}
      </Box>

      <Box bg="bg.muted" borderRadius="xl" padding="4">
        <HStack gap="2" color="brand.600">
          <GeoPin width={16} height={16} />
          <Strong fontSize="sm">{input.label}</Strong>
        </HStack>
        <Muted fontSize="sm">{input.text}</Muted>
        <Muted fontSize="xs">
          {input.city}
          {input.postalCode ? ` · CP ${input.postalCode}` : ''}
        </Muted>
      </Box>

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
