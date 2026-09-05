import { Box, HStack, Image, Spinner, VStack, useMediaQuery } from '@chakra-ui/react'
import Check from '@gravity-ui/icons/Check'
import { useNavigate, useParams } from 'react-router-dom'
import {
  BackButton,
  EmptyState,
  Muted,
  OrderItemsCard,
  OrderStatusBadge,
  OrderTotalCard,
  PageContainer,
  PageTitle,
  PrimaryButton,
  Strong,
} from '@repo/components'
import { useActiveTrip } from '@repo/api'
import { routes } from '../../routes'
import { buildStaticMapUrl } from '../../utils/geoapify'

export const TripOrderDetailPage = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { trip, isLoading, isMutating, pickup, deliver } = useActiveTrip()
  const [isDesktop] = useMediaQuery(['(min-width: 48em)'], { ssr: false })

  if (isLoading) {
    return (
      <Box paddingY="24" display="flex" justifyContent="center">
        <Spinner size="lg" color="brand.600" />
      </Box>
    )
  }

  if (!trip) {
    return (
      <EmptyState
        title="No hay viaje en curso"
        description="Este pedido no pertenece a un viaje activo."
      />
    )
  }

  const tripOrder = trip.orders.find((item) => item.order.id === orderId)

  if (!tripOrder) {
    return (
      <EmptyState
        title="Pedido no encontrado"
        description="No pudimos encontrar este pedido dentro del viaje."
      />
    )
  }

  const { order, pickedUp, delivered } = tripOrder

  const handleDeliver = async () => {
    await deliver(order.id)
    navigate(routes.home)
  }

  const { branch, deliveryAddress } = order
  const centerLat = branch
    ? (branch.latitude + deliveryAddress.latitude) / 2
    : deliveryAddress.latitude
  const centerLon = branch
    ? (branch.longitude + deliveryAddress.longitude) / 2
    : deliveryAddress.longitude
  const mapUrl = buildStaticMapUrl({
    centerLat,
    centerLon,
    zoom: 13,
    width: isDesktop ? 800 : 600,
    height: isDesktop ? 280 : 420,
    markers: [
      ...(branch
        ? [{ lat: branch.latitude, lon: branch.longitude, color: '#1d4ed8', label: 'R' }]
        : []),
      {
        lat: deliveryAddress.latitude,
        lon: deliveryAddress.longitude,
        color: '#15803d',
        label: 'E',
      },
    ],
  })

  return (
    <PageContainer>
      <BackButton />

      <VStack align="start" gap="1">
        <HStack gap="3" flexWrap="wrap">
          <PageTitle>Pedido #{order.number}</PageTitle>
          <OrderStatusBadge status={order.status} />
        </HStack>
        <Muted>{order.branch?.name}</Muted>
      </VStack>

      <Box
        bg="bg.panel"
        border="1px solid"
        borderColor="border.subtle"
        borderRadius="2xl"
        overflow="hidden"
      >
        <Image src={mapUrl} alt="Mapa del pedido" width="100%" height="auto" bg="bg.muted" />
        <Box padding="4">
          <VStack align="stretch" gap="2.5">
            <StopRow color="info" label="Retiro" value={order.branch?.addressText ?? '—'} />
            <StopRow color="success" label="Entrega" value={order.deliveryAddress.text} />
          </VStack>
        </Box>
      </Box>

      <OrderItemsCard items={order.items} />

      <OrderTotalCard total={order.total} />

      {order.client ? (
        <Box
          bg="bg.panel"
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="2xl"
          padding="5"
        >
          <Muted fontSize="sm" marginBottom="2">
            Contacto del cliente
          </Muted>
          <Strong>{`${order.client.firstName} ${order.client.lastName}`}</Strong>
          <Muted fontSize="sm" marginTop="1">
            {order.client.phone} · {order.client.email}
          </Muted>
        </Box>
      ) : null}

      {delivered ? (
        <HStack gap="1.5" color="success" justify="center" paddingY="2">
          <Check width={20} height={20} />
          <Strong>Entregado</Strong>
        </HStack>
      ) : (
        <PrimaryButton
          width="full"
          onClick={pickedUp ? handleDeliver : () => void pickup(order.id)}
          loading={isMutating}
        >
          {pickedUp ? 'Entregar' : 'Retirar'}
        </PrimaryButton>
      )}
    </PageContainer>
  )
}

const StopRow = ({ color, label, value }: { color: string; label: string; value: string }) => (
  <HStack gap="2.5" align="flex-start">
    <Box width="10px" height="10px" borderRadius="full" bg={color} flexShrink={0} marginTop="1.5" />
    <Box>
      <Strong fontSize="sm">{label}</Strong>
      <Muted fontSize="sm">{value}</Muted>
    </Box>
  </HStack>
)
