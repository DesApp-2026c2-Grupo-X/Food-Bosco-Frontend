import { Badge, Box, HStack, Text, VStack } from '@chakra-ui/react'
import Check from '@gravity-ui/icons/Check'
import RouteIcon from '@gravity-ui/icons/Route'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Card,
  EmptyState,
  InteractiveMap,
  LegendDotRow,
  LoadingState,
  Muted,
  OrderDetailShell,
  OrderItemsCard,
  OrderTotalCard,
  Price,
  PrimaryButton,
  SecondaryButton,
  Strong,
  type InteractiveMapMarker,
} from '@repo/components'
import { useActiveTrip, useOrder, useRiderProfile } from '@repo/api'
import { formatDistance, formatPrice, haversineDistanceMeters } from '@repo/domain'
import { MAP_MARKER_COLORS } from '@repo/theme'
import { routes } from '../../routes'
import { useRiderStore } from '../../stores/riderStore'
import { useRiderLocation } from '../../hooks/useRiderLocation'

const PROXIMITY_LIMIT_M = 50

export const TripOrderDetailPage = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { trip, isLoading: tripLoading, isMutating, pickup, deliver } = useActiveTrip()
  const { order, isLoading: orderLoading } = useOrder(orderId, { pollIntervalMs: 15000 })
  const { updateLocation } = useRiderProfile()
  const isOnline = useRiderStore((state) => state.isOnline)
  useRiderLocation(isOnline, updateLocation)
  const riderLocation = useRiderStore((state) => state.location)

  if (tripLoading || orderLoading) {
    return <LoadingState />
  }

  if (!trip) {
    return (
      <EmptyState
        title="No hay viaje en curso"
        description="Este pedido no pertenece a un viaje activo."
      />
    )
  }

  const tripOrder = trip.orders.find((item) => item.orderId === orderId)

  if (!tripOrder) {
    return (
      <EmptyState
        title="Pedido no encontrado"
        description="No pudimos encontrar este pedido dentro del viaje."
      />
    )
  }

  const delivered = tripOrder.status === 'DELIVERED'
  const pickedUp = delivered || tripOrder.status === 'ON_THE_WAY'

  const pickupMeters =
    riderLocation != null
      ? haversineDistanceMeters(riderLocation, tripOrder.pickupLocation)
      : Number.POSITIVE_INFINITY
  const riderToDeliveryMeters =
    riderLocation != null
      ? haversineDistanceMeters(riderLocation, tripOrder.deliveryAddress)
      : Number.POSITIVE_INFINITY
  const targetMeters = pickedUp ? riderToDeliveryMeters : pickupMeters
  const inRange = targetMeters <= PROXIMITY_LIMIT_M

  const deliveryDistanceMeters = haversineDistanceMeters(
    tripOrder.pickupLocation,
    tripOrder.deliveryAddress,
  )

  const center = riderLocation ?? {
    latitude: (tripOrder.pickupLocation.latitude + tripOrder.deliveryAddress.latitude) / 2,
    longitude: (tripOrder.pickupLocation.longitude + tripOrder.deliveryAddress.longitude) / 2,
  }

  const markers: InteractiveMapMarker[] = [
    {
      latitude: tripOrder.pickupLocation.latitude,
      longitude: tripOrder.pickupLocation.longitude,
      color: MAP_MARKER_COLORS.branch,
      label: 'R',
    },
    {
      latitude: tripOrder.deliveryAddress.latitude,
      longitude: tripOrder.deliveryAddress.longitude,
      color: MAP_MARKER_COLORS.client,
      label: 'E',
    },
  ]

  if (riderLocation) {
    markers.push({
      latitude: riderLocation.latitude,
      longitude: riderLocation.longitude,
      color: MAP_MARKER_COLORS.rider,
      label: 'T',
    })
  }

  const handleDeliver = async () => {
    await deliver(tripOrder.orderId)
    navigate(routes.home)
  }

  const target = pickedUp
    ? { lat: tripOrder.deliveryAddress.latitude, lng: tripOrder.deliveryAddress.longitude }
    : { lat: tripOrder.pickupLocation.latitude, lng: tripOrder.pickupLocation.longitude }
  const origin = riderLocation ? `&origin=${riderLocation.latitude},${riderLocation.longitude}` : ''
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${target.lat},${target.lng}&travelmode=driving${origin}`

  const earnings = trip.earnings ?? trip.estimatedEarnings
  const earningsSettled = trip.earnings != null

  return (
    <OrderDetailShell
      orderNumber={order?.number || tripOrder.orderId}
      status={order?.status ?? tripOrder.status}
      description={order?.branch?.name}
      showBack={false}
    >
      <InteractiveMap
        center={center}
        markers={markers}
        zoom={13}
        height="320px"
        alt="Mapa del pedido"
        legend={
          <VStack align="stretch" gap="2.5">
            <LegendDotRow
              color="info"
              label={
                <Box>
                  <Strong fontSize="sm">Retiro</Strong>
                  <Muted fontSize="sm">{order?.branch?.addressText ?? 'Sucursal'}</Muted>
                </Box>
              }
            />
            <LegendDotRow
              color="success"
              label={
                <Box>
                  <Strong fontSize="sm">Entrega</Strong>
                  <Muted fontSize="sm">{tripOrder.deliveryAddress.text}</Muted>
                </Box>
              }
            />
            <Muted fontSize="sm">
              Distancia de entrega (sucursal → dirección): {formatDistance(deliveryDistanceMeters)}
            </Muted>
          </VStack>
        }
      />

      <SecondaryButton
        width="full"
        onClick={() => window.open(mapsUrl, '_blank', 'noopener,noreferrer')}
      >
        <HStack gap="2">
          <RouteIcon width={18} height={18} />
          <Text>{pickedUp ? 'Navegar a la entrega' : 'Navegar a la sucursal'}</Text>
        </HStack>
      </SecondaryButton>

      <Card>
        <HStack justify="space-between" align="center">
          <VStack align="start" gap="1">
            <Muted fontSize="sm">Tu ganancia del viaje</Muted>
            <Price fontSize="2xl" fontWeight="bold">
              {formatPrice(earnings)}
            </Price>
          </VStack>
          <Badge
            colorPalette={earningsSettled ? 'green' : 'gray'}
            variant="subtle"
            borderRadius="full"
            paddingX="2.5"
            paddingY="1"
            flexShrink={0}
          >
            {earningsSettled ? 'Acreditada' : 'Estimada'}
          </Badge>
        </HStack>
      </Card>

      <OrderItemsCard items={order?.items ?? []} />

      <OrderTotalCard total={order?.total ?? 0} />

      {order?.client ? (
        <Card>
          <Muted fontSize="sm" marginBottom="2">
            Contacto del cliente
          </Muted>
          <Strong>{`${order.client.firstName} ${order.client.lastName}`}</Strong>
          <Muted fontSize="sm" marginTop="1">
            {order.client.phone} · {order.client.email}
          </Muted>
        </Card>
      ) : null}

      {delivered ? (
        <HStack gap="1.5" color="success" justify="center" paddingY="2">
          <Check width={20} height={20} />
          <Strong>Entregado</Strong>
        </HStack>
      ) : (
        <>
          <PrimaryButton
            width="full"
            onClick={pickedUp ? handleDeliver : () => void pickup(tripOrder.orderId)}
            loading={isMutating}
            disabled={!inRange || isMutating}
          >
            {pickedUp ? 'Entregar' : 'Retirar'}
          </PrimaryButton>
          {!inRange ? (
            <Muted fontSize="sm" textAlign="center">
              {riderLocation == null
                ? 'Activamos tu ubicación para verificar que estás en el punto.'
                : `Estás a ${Math.round(targetMeters)} m del punto de ${
                    pickedUp ? 'entrega' : 'retiro'
                  }. Acercate para continuar.`}
            </Muted>
          ) : null}
        </>
      )}
    </OrderDetailShell>
  )
}
