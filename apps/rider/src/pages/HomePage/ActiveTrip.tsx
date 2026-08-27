import { Box, HStack, Image, VStack, useMediaQuery } from '@chakra-ui/react'
import { Muted, PageTitle, WidePageContainer } from '@repo/components'
import type { RiderProfile, Trip } from '@repo/domain'
import { TripOrderCard } from '../../components/TripOrderCard'
import { buildStaticMapUrl } from '../../utils/geoapify'
import type { StaticMapMarker } from '../../utils/geoapify'
import { tripCenter, tripMarkers } from '../../utils/tripMap'

interface ActiveTripProps {
  trip: Trip
  isMutating: boolean
  profile: RiderProfile | null
  onPickup: (orderId: string) => void
  onDeliver: (orderId: string) => void
}

export const ActiveTrip = ({ trip, isMutating, profile, onPickup, onDeliver }: ActiveTripProps) => {
  const [isDesktop] = useMediaQuery(['(min-width: 48em)'], { ssr: false })

  const orders = trip.orders.map((tripOrder) => tripOrder.order)
  const deliveredCount = trip.orders.filter((tripOrder) => tripOrder.delivered).length
  const total = trip.orders.length
  const center = tripCenter(orders)

  const riderMarker: StaticMapMarker[] = profile?.currentLocation
    ? [
        {
          lat: profile.currentLocation.latitude,
          lon: profile.currentLocation.longitude,
          color: '#ea580c',
          icon: 'person-biking',
        },
      ]
    : []

  const mapUrl = buildStaticMapUrl({
    centerLat: center.lat,
    centerLon: center.lon,
    zoom: 13,
    width: isDesktop ? 1200 : 600,
    height: isDesktop ? 320 : 460,
    markers: [...tripMarkers(orders), ...riderMarker],
  })

  return (
    <WidePageContainer>
      <VStack align="start" gap="1">
        <PageTitle>Viaje en curso</PageTitle>
        <Muted>
          {deliveredCount} de {total} entregados
        </Muted>
      </VStack>

      <Box
        bg="bg.panel"
        border="1px solid"
        borderColor="border.subtle"
        borderRadius="2xl"
        overflow="hidden"
      >
        <Image src={mapUrl} alt="Mapa de ruta del viaje" width="100%" height="auto" bg="bg.muted" />
        <Box padding="4">
          <HStack gap="4">
            <LegendDot color="info" label="Retiro" />
            <LegendDot color="success" label="Entrega" />
            <LegendDot color="brand.500" label="Tu posición" />
          </HStack>
        </Box>
      </Box>

      <VStack align="stretch" gap="3">
        {trip.orders.map((tripOrder) => (
          <TripOrderCard
            key={tripOrder.order.id}
            tripOrder={tripOrder}
            isLoading={isMutating}
            onPickup={() => onPickup(tripOrder.order.id)}
            onDeliver={() => onDeliver(tripOrder.order.id)}
          />
        ))}
      </VStack>
    </WidePageContainer>
  )
}

const LegendDot = ({ color, label }: { color: string; label: string }) => (
  <HStack gap="1.5">
    <Box width="8px" height="8px" borderRadius="full" bg={color} />
    <Muted fontSize="sm">{label}</Muted>
  </HStack>
)
