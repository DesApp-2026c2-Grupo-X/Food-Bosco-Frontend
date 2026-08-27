import { HStack, Text, VStack } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import {
  BackButton,
  EmptyState,
  Muted,
  OrderStatusBadge,
  PageContainer,
  PageTitle,
  PrimaryButton,
  ResponsiveModal,
  SelectField,
  Strong,
} from '@repo/components'
import { formatOrderDate, formatPrice, ORDER_STATUS_LABELS, type OrderStatus } from '@repo/domain'
import { useOrderTransition } from './hooks/useOrderTransition'

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <VStack
    align="start"
    gap="2"
    bg="bg.panel"
    border="1px solid"
    borderColor="border.subtle"
    borderRadius="2xl"
    padding="5"
  >
    <Strong fontSize="lg">{title}</Strong>
    {children}
  </VStack>
)

export const OrderDetailPage = () => {
  const { orderId } = useParams()
  const {
    order,
    isLoading,
    isMutating,
    nextStatus,
    setNextStatus,
    confirmOpen,
    requestChange,
    confirmChange,
    cancel,
  } = useOrderTransition(orderId)

  if (!isLoading && !order) {
    return (
      <PageContainer>
        <BackButton />
        <EmptyState title="Pedido no encontrado" description="El pedido que buscás no existe." />
      </PageContainer>
    )
  }

  const transitions = order?.availableTransitions ?? []
  const transitionOptions = transitions.map((status) => ({
    value: status,
    label: ORDER_STATUS_LABELS[status],
  }))

  return (
    <PageContainer>
      <BackButton />

      <HStack justify="space-between" align="start" gap="4">
        <VStack align="start" gap="1">
          <PageTitle>{order ? `Pedido #${order.number}` : 'Pedido'}</PageTitle>
          {order ? <Muted>{formatOrderDate(order.createdAt)}</Muted> : null}
        </VStack>
        {order ? <OrderStatusBadge status={order.status} /> : null}
      </HStack>

      {order ? (
        <>
          <Card title="Cliente">
            <Text fontWeight="medium">{order.customer?.name ?? '—'}</Text>
            <Muted fontSize="sm">{order.customer?.phone ?? '—'}</Muted>
            <Muted fontSize="sm">{order.customer?.email ?? '—'}</Muted>
          </Card>

          <Card title="Entrega">
            <Muted fontSize="sm">{order.deliveryAddress}</Muted>
            <Muted fontSize="sm">Sucursal asignada: {order.branch}</Muted>
          </Card>

          <Card title="Detalle">
            <VStack align="stretch" gap="2" width="full">
              {order.items.map((item) => (
                <HStack key={item.id} justify="space-between">
                  <Text fontSize="sm">
                    {item.quantity} × {item.name}
                  </Text>
                  <Muted fontSize="sm">{formatPrice(item.unitPrice * item.quantity)}</Muted>
                </HStack>
              ))}
            </VStack>
            <HStack
              justify="space-between"
              width="full"
              borderTop="1px solid"
              borderColor="border.subtle"
              paddingTop="2"
            >
              <Strong>Total</Strong>
              <Strong>{formatPrice(order.total)}</Strong>
            </HStack>
          </Card>

          <Card title="Historial de estados">
            {order.statusHistory && order.statusHistory.length > 0 ? (
              <VStack align="stretch" gap="2" width="full">
                {order.statusHistory.map((entry, index) => (
                  <HStack key={`${entry.changedAt}-${index}`} justify="space-between">
                    <Muted fontSize="sm">{ORDER_STATUS_LABELS[entry.newStatus]}</Muted>
                    <Muted fontSize="xs">{formatTime(entry.changedAt)}</Muted>
                  </HStack>
                ))}
              </VStack>
            ) : (
              <Muted fontSize="sm">Sin cambios de estado aún.</Muted>
            )}
          </Card>

          <Card title="Cambiar estado">
            {transitions.length > 0 ? (
              <VStack align="stretch" gap="3" width="full">
                <SelectField
                  value={nextStatus}
                  onChange={(value) => setNextStatus(value as OrderStatus)}
                  options={transitionOptions}
                  placeholder="Siguiente estado..."
                  width="full"
                />
                <PrimaryButton
                  size="md"
                  disabled={!nextStatus || isMutating}
                  onClick={() => nextStatus && requestChange(nextStatus as OrderStatus)}
                >
                  Cambiar estado
                </PrimaryButton>
              </VStack>
            ) : (
              <Muted fontSize="sm">No hay transiciones disponibles para este pedido.</Muted>
            )}
          </Card>
        </>
      ) : null}

      <ResponsiveModal open={confirmOpen} onClose={cancel}>
        <VStack align="stretch" gap="4">
          <Strong fontSize="lg">Confirmar cambio de estado</Strong>
          <Muted>
            ¿Cambiar el pedido a {nextStatus ? ORDER_STATUS_LABELS[nextStatus as OrderStatus] : ''}?
          </Muted>
          <HStack justify="end" gap="2">
            <PrimaryButton size="md" loading={isMutating} onClick={confirmChange}>
              Confirmar
            </PrimaryButton>
          </HStack>
        </VStack>
      </ResponsiveModal>
    </PageContainer>
  )
}
