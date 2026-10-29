import { useState } from 'react'
import { HStack, VStack } from '@chakra-ui/react'
import ListUl from '@gravity-ui/icons/ListUl'
import { Link } from 'react-router-dom'
import {
  Card,
  EmptyState,
  LoadingState,
  Muted,
  OrderStatusBadge,
  PageContainer,
  PageHeader,
  Price,
  PrimaryButton,
  SecondaryButton,
  TextLink,
} from '@repo/components'
import { orderDetailPath, routes } from '../../routes'
import { ActiveOrderCard } from '../../components/ActiveOrderCard'
import { RepeatOrderModal } from '../../components/RepeatOrderModal'
import { formatPrice } from '@repo/domain'
import { formatOrderDate, isActiveOrder, type Order } from '@repo/domain'
import { useOrders } from '@repo/api'

export const OrdersPage = () => {
  const { orders, isLoading } = useOrders({ pollIntervalMs: 15000 })
  const [orderToRepeat, setOrderToRepeat] = useState<Order | null>(null)
  const activeOrders = orders.filter((order) => isActiveOrder(order.status))
  const pastOrders = orders.filter((order) => !isActiveOrder(order.status))

  return (
    <PageContainer>
      <PageHeader
        title="Mis pedidos"
        description="Seguí los pedidos en curso y revisá el historial."
        action={
          <TextLink to={routes.activity} fontSize="sm">
            Mi actividad
          </TextLink>
        }
      />

      {isLoading ? <LoadingState variant="list" skeletonCount={3} skeletonHeight="100px" /> : null}

      {!isLoading && activeOrders.length > 0 ? (
        <VStack align="stretch" gap="3">
          {activeOrders.map((order) => (
            <ActiveOrderCard key={order.id} order={order} />
          ))}
        </VStack>
      ) : null}

      <VStack gap="3" align="stretch">
        {!isLoading &&
          pastOrders.map((order) => (
            <Card key={order.id}>
              <HStack justify="space-between" align="start" gap="4">
                <VStack align="start" gap="1">
                  <TextLink to={orderDetailPath(order.id)} fontSize="lg">
                    Pedido #{order.number}
                  </TextLink>
                  <Muted fontSize="sm">{formatOrderDate(order.createdAt)}</Muted>
                </VStack>
                <OrderStatusBadge status={order.status} />
              </HStack>
              <HStack justify="space-between" marginTop="3">
                <Muted fontSize="sm">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} ítems ·{' '}
                  {order.branch?.name ?? 'Sucursal'}
                </Muted>
                <Price>{formatPrice(order.total)}</Price>
              </HStack>
              <HStack justify="flex-end" gap="2" marginTop="4" wrap="wrap">
                <SecondaryButton size="sm" asChild>
                  <Link to={orderDetailPath(order.id)}>Ver detalle</Link>
                </SecondaryButton>
                <SecondaryButton size="sm" onClick={() => setOrderToRepeat(order)}>
                  Repetir
                </SecondaryButton>
              </HStack>
            </Card>
          ))}
      </VStack>

      {!isLoading && orders.length === 0 ? (
        <EmptyState
          icon={<ListUl width={40} height={40} />}
          title="Todavía no tenés pedidos"
          description="Cuando hagas tu primer pedido, lo vas a ver acá."
          action={
            <PrimaryButton asChild>
              <Link to={routes.catalog}>Ir al catálogo</Link>
            </PrimaryButton>
          }
        />
      ) : null}

      {orderToRepeat ? (
        <RepeatOrderModal order={orderToRepeat} onClose={() => setOrderToRepeat(null)} />
      ) : null}
    </PageContainer>
  )
}
