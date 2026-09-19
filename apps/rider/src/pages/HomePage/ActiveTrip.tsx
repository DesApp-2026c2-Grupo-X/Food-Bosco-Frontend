import { HStack, VStack } from '@chakra-ui/react'
import {
  LegendDotRow,
  MapCard,
  PageHeader,
  WidePageContainer,
  useIsDesktop,
} from '@repo/components'
import type { Trip } from '@repo/domain'
import { MAP_MARKER_COLORS } from '@repo/theme'
import { buildStaticMapUrl, type StaticMapMarker } from '@repo/api'
import { TripOrderCardLoader } from '../../components/TripOrderCard/TripOrderCardLoader'
import { tripCenter, tripMarkers } from '../../utils/tripMap'

interface ActiveTripProps {
  trip: Trip
  isMutating: boolean
  riderLocation?: { latitude: number; longitude: number } | null
  onPickup: (orderId: string) => void
  onDeliver: (orderId: string) => void
}

export const ActiveTrip = ({
  trip,
  isMutating,
  riderLocation,
  onPickup,
  onDeliver,
}: ActiveTripProps) => {
  const isDesktop = useIsDesktop()

  const deliveredCount = trip.orders.filter((tripOrder) => tripOrder.deliveredAt != null).length
  const total = trip.orders.length
  const center = tripCenter(trip.orders)

  const riderMarker: StaticMapMarker[] = riderLocation
    ? [
        {
          lat: riderLocation.latitude,
          lon: riderLocation.longitude,
          color: MAP_MARKER_COLORS.rider,
          icon: 'person-biking',
        },
      ]
    : []

  const mapUrl = buildStaticMapUrl({
    centerLat: center.latitude,
    centerLon: center.longitude,
    zoom: 13,
    width: isDesktop ? 1200 : 600,
    height: isDesktop ? 320 : 460,
    markers: [...tripMarkers(trip.orders), ...riderMarker],
  })

  return (
    <WidePageContainer>
      <PageHeader title="Viaje en curso" description={`${deliveredCount} de ${total} entregados`} />

      <MapCard
        src={mapUrl}
        alt="Mapa de ruta del viaje"
        height={isDesktop ? '320px' : '460px'}
        legend={
          <HStack gap="4">
            <LegendDotRow color="info" label="Retiro" />
            <LegendDotRow color="success" label="Entrega" />
            <LegendDotRow color="brand.500" label="Tu posición" />
          </HStack>
        }
      />

      <VStack align="stretch" gap="3">
        {trip.orders.map((tripOrder) => (
          <TripOrderCardLoader
            key={tripOrder.orderId}
            tripOrder={tripOrder}
            isLoading={isMutating}
            riderLocation={riderLocation}
            onPickup={() => onPickup(tripOrder.orderId)}
            onDeliver={() => onDeliver(tripOrder.orderId)}
          />
        ))}
      </VStack>
    </WidePageContainer>
  )
}
