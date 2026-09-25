import { HStack } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import {
  Card,
  Muted,
  OrderStatusBadge,
  OrderTimeline,
  PrimaryButton,
  Strong,
} from '@repo/components'
import { formatEta, type Order } from '@repo/domain'
import { orderDetailPath } from '../../routes'

export const ActiveOrderCard = ({ order }: { order: Order }) => (
  <Card variant="subtle">
    <HStack justify="space-between" marginBottom="2">
      <Strong fontSize="lg">Pedido #{order.number}</Strong>
      <OrderStatusBadge status={order.status} />
    </HStack>
    <Muted fontSize="sm" marginBottom="4">
      {order.branch?.name ?? 'Sucursal'} ·{' '}
      {order.estimatedDeliveryAt ? formatEta(order.estimatedDeliveryAt) : 'Estimando tiempo'}
    </Muted>
    <OrderTimeline status={order.status} />
    <PrimaryButton asChild marginTop="5" width="full">
      <Link to={orderDetailPath(order.id)}>Ver seguimiento</Link>
    </PrimaryButton>
  </Card>
)
