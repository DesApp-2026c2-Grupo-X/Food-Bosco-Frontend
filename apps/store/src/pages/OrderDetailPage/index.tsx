import { useRef } from 'react'
import { Box, HStack, VStack } from '@chakra-ui/react'
import CircleCheckFill from '@gravity-ui/icons/CircleCheckFill'
import CircleXmarkFill from '@gravity-ui/icons/CircleXmarkFill'
import { Link, useParams } from 'react-router-dom'
import {
  Card,
  EmptyState,
  LegendDotRow,
  LoadingState,
  MapCard,
  Muted,
  OrderDetailShell,
  OrderItemsCard,
  OrderTimeline,
  OrderTotalCard,
  PrimaryButton,
  Strong,
  Subtle,
  useIsDesktop,
} from '@repo/components'
import { buildStaticMapUrl, useOrder, type StaticMapMarker } from '@repo/api'
import { routes } from '../../routes'
import type { Order } from '@repo/domain'
import { formatEta, formatOrderDate, isActiveOrder } from '@repo/domain'
import { MAP_MARKER_COLORS } from '@repo/theme'

export const OrderDetailPage = () => {
  const { orderId } = useParams()
  const orderRef = useRef<Order | null>(null)
  const pollActive = orderRef.current ? isActiveOrder(orderRef.current.status) : false
  const { order, isLoading } = useOrder(orderId, {
    pollIntervalMs: orderId && pollActive ? 4000 : undefined,
  })
  orderRef.current = order

  if (isLoading) {
    return <LoadingState />
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
    <OrderDetailShell
      orderNumber={order.number}
      status={order.status}
      description={`Realizado el ${formatOrderDate(order.createdAt)}`}
    >
      {active ? (
        <>
          <Card variant="subtle">
            <Strong marginBottom="4">Estado del pedido</Strong>
            <OrderTimeline status={order.status} />
            <Muted fontSize="sm" marginTop="4">
              {order.branch?.name ?? 'Sucursal'} ·{' '}
              {order.estimatedDeliveryAt
                ? formatEta(order.estimatedDeliveryAt)
                : 'Estimando tiempo'}
            </Muted>
          </Card>
          {order.branch ? <TrackingMap order={order} /> : null}
        </>
      ) : null}

      {order.status === 'CANCELLED' ? (
        <Card>
          <Box color="danger" display="flex" marginBottom="2">
            <CircleXmarkFill width={28} height={28} />
          </Box>
          <Strong fontSize="lg">Pedido cancelado</Strong>
          <Muted fontSize="sm" marginTop="1">
            Este pedido fue cancelado.
          </Muted>
        </Card>
      ) : null}

      {order.status === 'DELIVERED' ? (
        <Card>
          <Box color="success" display="flex" marginBottom="2">
            <CircleCheckFill width={28} height={28} />
          </Box>
          <Strong fontSize="lg">Entregado</Strong>
          <Muted fontSize="sm" marginTop="1">
            Recibido el {deliveredAt ? formatOrderDate(deliveredAt) : '—'}
          </Muted>
        </Card>
      ) : null}

      <OrderItemsCard items={order.items} />

      <OrderTotalCard total={order.total} subtitle={`Entrega a ${order.deliveryAddress.text}`} />
    </OrderDetailShell>
  )
}

const TrackingMap = ({ order }: { order: Order }) => {
  const isDesktop = useIsDesktop()
  const branch = order.branch
  const riderLocation = order.riderLocation ?? null

  if (!branch) return null

  const centerLat = (branch.latitude + order.deliveryAddress.latitude) / 2
  const centerLon = (branch.longitude + order.deliveryAddress.longitude) / 2

  const markers: StaticMapMarker[] = [
    { lat: branch.latitude, lon: branch.longitude, color: MAP_MARKER_COLORS.branch, label: 'T' },
    {
      lat: order.deliveryAddress.latitude,
      lon: order.deliveryAddress.longitude,
      color: MAP_MARKER_COLORS.client,
      label: 'C',
    },
  ]

  if (riderLocation) {
    markers.push({
      lat: riderLocation.latitude,
      lon: riderLocation.longitude,
      color: MAP_MARKER_COLORS.rider,
      icon: 'person-biking',
    })
  }

  const mapUrl = buildStaticMapUrl({
    centerLat,
    centerLon,
    zoom: 13,
    width: isDesktop ? 1200 : 600,
    height: isDesktop ? 340 : 700,
    markers,
  })

  const legend = [
    { color: 'info', title: 'Tienda', subtitle: branch.addressText },
    {
      color: 'success',
      title: 'Tu dirección',
      subtitle: order.deliveryAddress.text,
    },
  ]

  if (riderLocation) {
    legend.push({ color: 'brand.500', title: 'Rider', subtitle: 'En camino' })
  }

  return (
    <MapCard
      src={mapUrl}
      alt="Mapa de seguimiento del pedido"
      height={isDesktop ? '340px' : '700px'}
      legend={
        <VStack gap="2.5" align="stretch">
          <HStack justify="space-between">
            <Strong>Seguimiento en vivo</Strong>
            <HStack gap="1.5" color="success" alignItems="center">
              <Box width="8px" height="8px" borderRadius="full" bg="currentColor" />
              <Strong fontSize="xs">En vivo</Strong>
            </HStack>
          </HStack>
          {legend.map((item) => (
            <LegendDotRow
              key={item.title}
              color={item.color}
              label={
                <Box>
                  <Strong fontSize="sm">{item.title}</Strong>
                  <Muted fontSize="sm">{item.subtitle}</Muted>
                </Box>
              }
            />
          ))}
        </VStack>
      }
      note={
        <Subtle fontSize="2xs" marginTop="3">
          © OpenStreetMap · Geoapify
        </Subtle>
      }
    />
  )
}
