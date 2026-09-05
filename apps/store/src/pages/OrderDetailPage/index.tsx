import { Box, HStack, Image, Spinner, VStack, useMediaQuery } from '@chakra-ui/react'
import CircleCheckFill from '@gravity-ui/icons/CircleCheckFill'
import CircleXmarkFill from '@gravity-ui/icons/CircleXmarkFill'
import { Link, useParams } from 'react-router-dom'
import {
  BackButton,
  Muted,
  OrderItemsCard,
  OrderTotalCard,
  PageContainer,
  PageTitle,
  PrimaryButton,
  Strong,
  Subtle,
} from '@repo/components'
import { EmptyState } from '@repo/components'
import { OrderStatusBadge } from '@repo/components'
import { OrderTimeline } from '@repo/components'
import { useOrder } from '@repo/api'
import { routes } from '../../routes'
import type { Order } from '@repo/domain'
import { buildStaticMapUrl } from '../../utils/geoapify'
import { formatOrderDate, isActiveOrder } from '@repo/domain'
import { useRiderPosition } from './hooks/useRiderPosition'

export const OrderDetailPage = () => {
  const { orderId } = useParams()
  const { order, isLoading } = useOrder(orderId)

  if (isLoading) {
    return (
      <Box paddingY="24" display="flex" justifyContent="center">
        <Spinner size="lg" color="brand.600" />
      </Box>
    )
  }

  if (!order) {
    return (
      <EmptyState
        title="Pedido no encontrado"
        description="No pudimos encontrar este pedido. Probá desde la lista de pedidos."
        action={
          <PrimaryButton asChild>
            <Link to={routes.orders}>Volver a mis pedidos</Link>
          </PrimaryButton>
        }
      />
    )
  }

  const active = isActiveOrder(order.status)
  const deliveredAt = order.statusHistory.find(
    (entry) => entry.newStatus === 'DELIVERED',
  )?.changedAt

  return (
    <PageContainer>
      <BackButton />

      <VStack align="start" gap="1">
        <HStack gap="3" flexWrap="wrap">
          <PageTitle>Pedido #{order.number}</PageTitle>
          <OrderStatusBadge status={order.status} />
        </HStack>
        <Muted>Realizado el {formatOrderDate(order.createdAt)}</Muted>
      </VStack>

      {active ? (
        <>
          <Box
            bg="bg.subtle"
            border="1px solid"
            borderColor="border.subtle"
            borderRadius="2xl"
            padding="5"
          >
            <Strong marginBottom="4">Estado del pedido</Strong>
            <OrderTimeline status={order.status} />
            <Muted fontSize="sm" marginTop="4">
              {order.branch?.name ?? 'Sucursal'} ·{' '}
              {order.estimatedDeliveryAt
                ? formatEtaLabel(order.estimatedDeliveryAt)
                : 'Estimando tiempo'}
            </Muted>
          </Box>
          {order.branch ? <TrackingMap order={order} /> : null}
        </>
      ) : null}

      {order.status === 'CANCELLED' ? (
        <Box
          bg="bg.panel"
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="2xl"
          padding="5"
        >
          <Box color="danger" display="flex" marginBottom="2">
            <CircleXmarkFill width={28} height={28} />
          </Box>
          <Strong fontSize="lg">Pedido cancelado</Strong>
          <Muted fontSize="sm" marginTop="1">
            Este pedido fue cancelado.
          </Muted>
        </Box>
      ) : null}

      {order.status === 'DELIVERED' ? (
        <Box
          bg="bg.panel"
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="2xl"
          padding="5"
        >
          <Box color="success" display="flex" marginBottom="2">
            <CircleCheckFill width={28} height={28} />
          </Box>
          <Strong fontSize="lg">Entregado</Strong>
          <Muted fontSize="sm" marginTop="1">
            Recibido el {deliveredAt ? formatOrderDate(deliveredAt) : '—'}
          </Muted>
        </Box>
      ) : null}

      <OrderItemsCard items={order.items} />

      <OrderTotalCard total={order.total} subtitle={`Entrega a ${order.deliveryAddress.text}`} />
    </PageContainer>
  )
}

const formatEtaLabel = (iso: string) => {
  const minutes = Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 60000))
  return minutes < 60 ? `~${minutes} min` : `~${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

const TrackingMap = ({ order }: { order: Order }) => {
  const [isDesktop] = useMediaQuery(['(min-width: 48em)'], { ssr: false })
  const branch = order.branch

  const riderPosition = useRiderPosition(
    { lat: branch?.latitude ?? 0, lon: branch?.longitude ?? 0 },
    { lat: order.deliveryAddress.latitude, lon: order.deliveryAddress.longitude },
    Boolean(branch),
  )

  if (!branch) return null

  const centerLat = (branch.latitude + order.deliveryAddress.latitude) / 2
  const centerLon = (branch.longitude + order.deliveryAddress.longitude) / 2

  const mapUrl = buildStaticMapUrl({
    centerLat,
    centerLon,
    zoom: 13,
    width: isDesktop ? 1200 : 600,
    height: isDesktop ? 340 : 700,
    markers: [
      { lat: branch.latitude, lon: branch.longitude, color: '#1d4ed8', label: 'T' },
      {
        lat: order.deliveryAddress.latitude,
        lon: order.deliveryAddress.longitude,
        color: '#15803d',
        label: 'C',
      },
      {
        lat: riderPosition.lat,
        lon: riderPosition.lon,
        color: '#ea580c',
        icon: 'person-biking',
      },
    ],
  })

  const legend = [
    { color: 'info', title: 'Tienda', subtitle: branch.addressText },
    {
      color: 'success',
      title: 'Tu dirección',
      subtitle: order.deliveryAddress.text,
    },
    { color: 'brand.500', title: 'Rider', subtitle: 'En camino' },
  ]

  return (
    <Box
      bg="bg.panel"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="2xl"
      overflow="hidden"
    >
      <Box padding="4" paddingBottom="3">
        <HStack justify="space-between">
          <Strong>Seguimiento en vivo</Strong>
          <HStack gap="1.5" color="success" alignItems="center">
            <Box width="8px" height="8px" borderRadius="full" bg="currentColor" />
            <Strong fontSize="xs">En vivo</Strong>
          </HStack>
        </HStack>
      </Box>
      <Image
        src={mapUrl}
        alt="Mapa de seguimiento del pedido"
        width="100%"
        height="auto"
        bg="bg.muted"
      />
      <Box padding="4">
        <VStack gap="2.5" align="stretch">
          {legend.map((item) => (
            <HStack key={item.title} gap="2.5" align="flex-start">
              <Box
                width="10px"
                height="10px"
                borderRadius="full"
                bg={item.color}
                flexShrink={0}
                marginTop="1.5"
              />
              <Box>
                <Strong fontSize="sm">{item.title}</Strong>
                <Muted fontSize="sm">{item.subtitle}</Muted>
              </Box>
            </HStack>
          ))}
        </VStack>
        <Subtle fontSize="2xs" marginTop="3">
          © OpenStreetMap · Geoapify
        </Subtle>
      </Box>
    </Box>
  )
}
