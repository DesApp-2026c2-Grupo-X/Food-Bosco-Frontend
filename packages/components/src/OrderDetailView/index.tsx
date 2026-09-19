import { HStack, Text, VStack } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import { useOrderTransition } from '@repo/api'
import {
  formatOrderDate,
  formatOrderTime,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from '@repo/domain'
import { BackButton } from '../BackButton'
import { Card } from '../Card'
import { ConfirmDeleteModal } from '../ConfirmDeleteModal'
import { EmptyState } from '../feedback'
import { OrderItemsCard } from '../OrderItemsCard'
import { OrderStatusBadge } from '../OrderStatusBadge'
import { OrderTotalCard } from '../OrderTotalCard'
import { PageContainer } from '../PageContainer'
import { PrimaryButton } from '../Button'
import { SelectField } from '../SelectField'
import { Muted, PageTitle, Strong } from '../typography'
import type { OrderDetailCardProps } from './types'

const SectionCard = ({ title, children }: OrderDetailCardProps) => (
  <Card>
    <VStack align="start" gap="2">
      <Strong fontSize="lg">{title}</Strong>
      {children}
    </VStack>
  </Card>
)

export const OrderDetailView = () => {
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
          <SectionCard title="Cliente">
            <Text fontWeight="medium">
              {order.client ? `${order.client.firstName} ${order.client.lastName}` : '—'}
            </Text>
            <Muted fontSize="sm">{order.client?.phone ?? '—'}</Muted>
            <Muted fontSize="sm">{order.client?.email ?? '—'}</Muted>
          </SectionCard>

          <SectionCard title="Entrega">
            <Muted fontSize="sm">{order.deliveryAddress.text}</Muted>
            <Muted fontSize="sm">Sucursal asignada: {order.branch?.name ?? '—'}</Muted>
          </SectionCard>

          <OrderItemsCard title="Detalle" items={order.items} />

          <OrderTotalCard total={order.total} />

          <SectionCard title="Historial de estados">
            {order.statusHistory && order.statusHistory.length > 0 ? (
              <VStack align="stretch" gap="2" width="full">
                {order.statusHistory.map((entry, index) => (
                  <HStack key={`${entry.changedAt}-${index}`} justify="space-between">
                    <Muted fontSize="sm">{ORDER_STATUS_LABELS[entry.newStatus]}</Muted>
                    <Muted fontSize="xs">{formatOrderTime(entry.changedAt)}</Muted>
                  </HStack>
                ))}
              </VStack>
            ) : (
              <Muted fontSize="sm">Sin cambios de estado aún.</Muted>
            )}
          </SectionCard>

          <SectionCard title="Cambiar estado">
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
          </SectionCard>
        </>
      ) : null}

      <ConfirmDeleteModal
        open={confirmOpen}
        title="Confirmar cambio de estado"
        description={`¿Cambiar el pedido a ${
          nextStatus ? ORDER_STATUS_LABELS[nextStatus as OrderStatus] : ''
        }?`}
        confirmLabel="Confirmar"
        isSubmitting={isMutating}
        onClose={cancel}
        onConfirm={confirmChange}
      />
    </PageContainer>
  )
}
