import { Box, HStack, Link as ChakraLink, VStack } from '@chakra-ui/react'
import ListUl from '@gravity-ui/icons/ListUl'
import { Link } from 'react-router-dom'
import {
  EmptyState,
  Muted,
  PageContainer,
  PageTitle,
  Price,
  PrimaryButton,
  Strong,
} from '@repo/components'
import { OrderStatusBadge } from '@repo/components'
import { OrderTimeline } from '@repo/components'
import { orderDetailPath, routes } from '../../routes'
import { formatPrice } from '@repo/domain'
import { formatOrderDate, isActiveOrder } from '@repo/domain'
import { MOCK_ORDERS } from '@repo/api'

export const OrdersPage = () => {
  const activeOrder = MOCK_ORDERS.find((order) => isActiveOrder(order.status))
  const pastOrders = MOCK_ORDERS.filter((order) => !isActiveOrder(order.status))

  return (
    <PageContainer>
      <VStack align="start" gap="1">
        <PageTitle>Mis pedidos</PageTitle>
        <Muted>Seguí los pedidos en curso y revisá el historial.</Muted>
      </VStack>

      {activeOrder ? (
        <Box
          bg="bg.subtle"
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="2xl"
          padding="5"
        >
          <HStack justify="space-between" marginBottom="2">
            <Strong fontSize="lg">Pedido #{activeOrder.number}</Strong>
            <OrderStatusBadge status={activeOrder.status} />
          </HStack>
          <Muted fontSize="sm" marginBottom="4">
            {activeOrder.branch} · {activeOrder.eta ?? 'Estimando tiempo'}
          </Muted>
          <OrderTimeline status={activeOrder.status} />
          <PrimaryButton asChild marginTop="5" width="full">
            <Link to={orderDetailPath(activeOrder.id)}>Ver seguimiento</Link>
          </PrimaryButton>
        </Box>
      ) : null}

      <VStack gap="3" align="stretch">
        {pastOrders.map((order) => (
          <ChakraLink
            asChild
            key={order.id}
            display="block"
            bg="bg.panel"
            border="1px solid"
            borderColor="border.subtle"
            borderRadius="2xl"
            padding="5"
            _hover={{ borderColor: 'border.emphasized' }}
          >
            <Link to={orderDetailPath(order.id)}>
              <HStack justify="space-between">
                <VStack align="start" gap="0.5">
                  <Strong>Pedido #{order.number}</Strong>
                  <Muted fontSize="sm">{formatOrderDate(order.createdAt)}</Muted>
                </VStack>
                <OrderStatusBadge status={order.status} />
              </HStack>
              <HStack justify="space-between" marginTop="3">
                <Muted fontSize="sm">
                  {order.itemCount} {order.itemCount === 1 ? 'ítem' : 'ítems'} · {order.branch}
                </Muted>
                <Price>{formatPrice(order.total)}</Price>
              </HStack>
            </Link>
          </ChakraLink>
        ))}
      </VStack>

      {MOCK_ORDERS.length === 0 ? (
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
