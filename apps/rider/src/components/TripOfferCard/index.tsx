import { Box, HStack, Image, Text, VStack, useMediaQuery } from '@chakra-ui/react'
import Clock from '@gravity-ui/icons/Clock'
import { Eyebrow, GhostButton, Muted, Price, PrimaryButton, Strong } from '@repo/components'
import { formatPrice } from '@repo/domain'
import { buildStaticMapUrl } from '../../utils/geoapify'
import { tripCenter, tripMarkers } from '../../utils/tripMap'
import { useOfferCountdown } from './hooks/useOfferCountdown'
import type { TripOfferCardProps } from './types'

const formatCountdown = (total: number) => {
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export const TripOfferCard = ({ offer, isLoading, onAccept, onReject }: TripOfferCardProps) => {
  const [isDesktop] = useMediaQuery(['(min-width: 48em)'], { ssr: false })
  const remaining = useOfferCountdown(offer.expiresAt, onReject)

  const center = tripCenter(offer.orders)
  const mapUrl = buildStaticMapUrl({
    centerLat: center.lat,
    centerLon: center.lon,
    zoom: 13,
    width: isDesktop ? 1200 : 600,
    height: isDesktop ? 320 : 460,
    markers: tripMarkers(offer.orders),
  })

  const orderCount = offer.orders.length

  return (
    <Box
      bg="bg.panel"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="2xl"
      overflow="hidden"
    >
      <Box padding="5">
        <VStack align="stretch" gap="4">
          <VStack align="start" gap="1">
            <Eyebrow>Nueva oferta de viaje</Eyebrow>
            <Strong fontSize="xl">
              {orderCount} {orderCount === 1 ? 'orden' : 'órdenes'} · {offer.distanceKm} km · ~
              {offer.estimatedMinutes} min
            </Strong>
          </VStack>

          <Box width="full" borderRadius="xl" overflow="hidden" bg="bg.muted">
            <Image src={mapUrl} alt="Mapa de ruta de la oferta" width="100%" height="auto" />
          </Box>

          <HStack justify="space-between" align="flex-end">
            <VStack align="start" gap="0.5">
              <Muted fontSize="sm">Ganancia estimada</Muted>
              <Price fontSize="3xl" fontWeight="bold">
                {formatPrice(offer.estimatedEarnings)}
              </Price>
            </VStack>
            <HStack gap="1.5" color={remaining <= 10 ? 'danger' : 'fg.muted'}>
              <Clock width={16} height={16} />
              <Text fontSize="sm" fontWeight="semibold" fontVariantNumeric="tabular-nums">
                {formatCountdown(remaining)}
              </Text>
            </HStack>
          </HStack>

          <HStack gap="2">
            <PrimaryButton flex="1" onClick={onAccept} loading={isLoading}>
              Aceptar
            </PrimaryButton>
            <GhostButton onClick={onReject} disabled={isLoading}>
              Rechazar
            </GhostButton>
          </HStack>
        </VStack>
      </Box>
    </Box>
  )
}
