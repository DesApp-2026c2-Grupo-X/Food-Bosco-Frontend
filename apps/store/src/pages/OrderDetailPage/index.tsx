import { useEffect, useState } from 'react'
import { Box, HStack, VStack } from '@chakra-ui/react'
import CircleCheckFill from '@gravity-ui/icons/CircleCheckFill'
import CircleXmarkFill from '@gravity-ui/icons/CircleXmarkFill'
import { Link, useParams } from 'react-router-dom'
import {
  Card,
  EmptyState,
  InteractiveMap,
  LegendDotRow,
  LoadingState,
  Muted,
  OrderDetailShell,
  OrderItemsCard,
  OrderTimeline,
  OrderTotalCard,
  PrimaryButton,
  StarRating,
  Strong,
  Subtle,
  type InteractiveMapMarker,
} from '@repo/components'
import { useOrder, useOrderReviewStatus } from '@repo/api'
import { RepeatOrderModal } from '../../components/RepeatOrderModal'
import { ReviewOrderModal } from '../../components/ReviewOrderModal'
import { routes } from '../../routes'
import type { Order } from '@repo/domain'
import { formatEta, formatOrderDate, isActiveOrder } from '@repo/domain'
import { MAP_MARKER_COLORS } from '@repo/theme'

const ACTIVE_POLL_INTERVAL_MS = 4000

export const OrderDetailPage = () => {
  const { orderId } = useParams()
  const { order, isLoading, startPolling, stopPolling } = useOrder(orderId)
  const {
    status: reviewStatus,
    isLoading: reviewStatusLoading,
    refetch: refetchReviewStatus,
  } = useOrderReviewStatus(orderId)
  const [repeatOpen, setRepeatOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)

  // El estado del pedido cambia del lado del servidor: mientras el pedido esté
  // activo, volvemos a consultarlo para reflejar el progreso (y el rider) en vivo.
  useEffect(() => {
    if (!orderId) return
    startPolling(ACTIVE_POLL_INTERVAL_MS)
    return () => stopPolling()
  }, [orderId, startPolling, stopPolling])

  const orderStatus = order?.status

  useEffect(() => {
    if (!orderStatus || isActiveOrder(orderStatus)) return
    stopPolling()
    if (orderStatus === 'DELIVERED') {
      void refetchReviewStatus()
    }
  }, [orderStatus, stopPolling, refetchReviewStatus])

  if (isLoading) {
    return <LoadingState variant="list" skeletonCount={4} skeletonHeight="88px" />
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

          {reviewStatus?.review ? (
            <VStack align="start" gap="3" marginTop="4">
              <Strong>Pedido calificado</Strong>
              <VStack align="start" gap="1">
                <HStack gap="3">
                  <Muted fontSize="sm" minWidth="70px">
                    Sucursal
                  </Muted>
                  <StarRating
                    value={reviewStatus.review.branchRating}
                    readOnly
                    size="sm"
                    label="Calificación de la sucursal"
                  />
                </HStack>
                {reviewStatus.review.branchComment ? (
                  <Muted fontSize="sm">{reviewStatus.review.branchComment}</Muted>
                ) : null}
              </VStack>
              {reviewStatus.review.courierRating != null ? (
                <VStack align="start" gap="1">
                  <HStack gap="3">
                    <Muted fontSize="sm" minWidth="70px">
                      Repartidor
                    </Muted>
                    <StarRating
                      value={reviewStatus.review.courierRating}
                      readOnly
                      size="sm"
                      label="Calificación del repartidor"
                    />
                  </HStack>
                  {reviewStatus.review.courierComment ? (
                    <Muted fontSize="sm">{reviewStatus.review.courierComment}</Muted>
                  ) : null}
                </VStack>
              ) : null}
            </VStack>
          ) : reviewStatus?.canReview && !reviewStatusLoading ? (
            <VStack align="start" gap="2" marginTop="4">
              <Muted fontSize="sm">Contanos cómo fue tu experiencia con este pedido.</Muted>
              <PrimaryButton type="button" size="md" onClick={() => setReviewOpen(true)}>
                Calificar pedido
              </PrimaryButton>
            </VStack>
          ) : null}
        </Card>
      ) : null}

      {!active ? (
        <Card variant="subtle">
          <VStack align="start" gap="3">
            <Strong fontSize="lg">¿Querés pedirlo de nuevo?</Strong>
            <Muted fontSize="sm">
              Armamos un carrito nuevo con los productos disponibles y los precios actuales.
            </Muted>
            <PrimaryButton type="button" onClick={() => setRepeatOpen(true)}>
              Repetir pedido
            </PrimaryButton>
          </VStack>
        </Card>
      ) : null}

      <OrderItemsCard items={order.items} />

      <OrderTotalCard
        subtotal={order.subtotal ?? order.total}
        discountTotal={order.discountTotal ?? 0}
        appliedPromotions={order.appliedPromotions ?? []}
        total={order.total}
        subtitle={`Entrega a ${order.deliveryAddress.text}`}
      />

      {repeatOpen ? <RepeatOrderModal order={order} onClose={() => setRepeatOpen(false)} /> : null}
      {reviewOpen ? (
        <ReviewOrderModal
          open={reviewOpen}
          order={order}
          onClose={() => setReviewOpen(false)}
          onSubmitted={() => void refetchReviewStatus()}
        />
      ) : null}
    </OrderDetailShell>
  )
}

const TrackingMap = ({ order }: { order: Order }) => {
  const branch = order.branch
  const riderLocation = order.riderLocation ?? null

  if (!branch) return null

  const delivery = {
    latitude: order.deliveryAddress.latitude,
    longitude: order.deliveryAddress.longitude,
  }
  const center = riderLocation ?? {
    latitude: (branch.latitude + delivery.latitude) / 2,
    longitude: (branch.longitude + delivery.longitude) / 2,
  }

  const markers: InteractiveMapMarker[] = [
    {
      latitude: branch.latitude,
      longitude: branch.longitude,
      color: MAP_MARKER_COLORS.branch,
      label: 'T',
      kind: 'branch',
    },
    {
      latitude: delivery.latitude,
      longitude: delivery.longitude,
      color: MAP_MARKER_COLORS.client,
      label: 'C',
      kind: 'client',
    },
  ]

  if (riderLocation) {
    markers.push({
      latitude: riderLocation.latitude,
      longitude: riderLocation.longitude,
      color: MAP_MARKER_COLORS.rider,
      label: 'R',
      kind: 'rider',
    })
  }

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
    <InteractiveMap
      center={center}
      markers={markers}
      zoom={13}
      height="320px"
      alt="Mapa de seguimiento del pedido"
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
          Mapa interactivo
        </Subtle>
      }
    />
  )
}
