import { Box, HStack, VStack } from '@chakra-ui/react'
import Check from '@gravity-ui/icons/Check'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Card,
  EmptyState,
  LegendDotRow,
  LoadingState,
  MapCard,
  Muted,
  OrderDetailShell,
  OrderItemsCard,
  OrderTotalCard,
  PrimaryButton,
  Strong,
  useIsDesktop,
} from '@repo/components'
import { buildStaticMapUrl, useActiveTrip, useOrder } from '@repo/api'
import { MAP_MARKER_COLORS } from '@repo/theme'
import { routes } from '../../routes'

export const TripOrderDetailPage = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { trip, isLoading: tripLoading, isMutating, pickup, deliver } = useActiveTrip()
  const { order, isLoading: orderLoading } = useOrder(orderId)
  const isDesktop = useIsDesktop()

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

  const handleDeliver = async () => {
    await deliver(tripOrder.orderId)
    navigate(routes.home)
  }

  const centerLat = (tripOrder.pickupLocation.latitude + tripOrder.deliveryAddress.latitude) / 2
  const centerLon = (tripOrder.pickupLocation.longitude + tripOrder.deliveryAddress.longitude) / 2
  const mapUrl = buildStaticMapUrl({
    centerLat,
    centerLon,
    zoom: 13,
    width: isDesktop ? 800 : 600,
    height: isDesktop ? 280 : 420,
    markers: [
      {
        lat: tripOrder.pickupLocation.latitude,
        lon: tripOrder.pickupLocation.longitude,
        color: MAP_MARKER_COLORS.branch,
        label: 'R',
      },
      {
        lat: tripOrder.deliveryAddress.latitude,
        lon: tripOrder.deliveryAddress.longitude,
        color: MAP_MARKER_COLORS.client,
        label: 'E',
      },
    ],
  })

  return (
    <OrderDetailShell
      orderNumber={order?.number ?? tripOrder.orderId}
      status={order?.status ?? tripOrder.status}
      description={order?.branch?.name}
    >
      <MapCard
        src={mapUrl}
        alt="Mapa del pedido"
        height={isDesktop ? '280px' : '420px'}
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
          </VStack>
        }
      />

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
        <PrimaryButton
          width="full"
          onClick={pickedUp ? handleDeliver : () => void pickup(tripOrder.orderId)}
          loading={isMutating}
        >
          {pickedUp ? 'Entregar' : 'Retirar'}
        </PrimaryButton>
      )}
    </OrderDetailShell>
  )
}
