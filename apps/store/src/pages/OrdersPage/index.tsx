import { HStack, VStack } from '@chakra-ui/react'
import ListUl from '@gravity-ui/icons/ListUl'
import { Link } from 'react-router-dom'
import {
  EmptyState,
  Muted,
  OrderStatusBadge,
  PageContainer,
  PageHeader,
  Price,
  PrimaryButton,
  SummaryCard,
} from '@repo/components'
import { orderDetailPath, routes } from '../../routes'
import { ActiveOrderCard } from '../../components/ActiveOrderCard'
import { formatPrice } from '@repo/domain'
import { formatOrderDate, isActiveOrder } from '@repo/domain'
import { useOrders } from '@repo/api'

export const OrdersPage = () => {
  const { orders, isLoading } = useOrders({ pollIntervalMs: 15000 })
  const activeOrders = orders.filter((order) => isActiveOrder(order.status))
  const pastOrders = orders.filter((order) => !isActiveOrder(order.status))

  return (
    <PageContainer>
      <PageHeader
        title="Mis pedidos"
        description="Seguí los pedidos en curso y revisá el historial."
      />

      {activeOrders.length > 0 ? (
        <VStack align="stretch" gap="3">
          {activeOrders.map((order) => (
            <ActiveOrderCard key={order.id} order={order} />
          ))}
        </VStack>
      ) : null}

      <VStack gap="3" align="stretch">
        {pastOrders.map((order) => (
          <SummaryCard
            key={order.id}
            href={orderDetailPath(order.id)}
            title={`Pedido #${order.number}`}
            meta={formatOrderDate(order.createdAt)}
            trailing={<OrderStatusBadge status={order.status} />}
          >
            <HStack justify="space-between" marginTop="3">
              <Muted fontSize="sm">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)} ítems ·{' '}
                {order.branch?.name ?? 'Sucursal'}
              </Muted>
              <Price>{formatPrice(order.total)}</Price>
            </HStack>
          </SummaryCard>
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
    </PageContainer>
  )
}
