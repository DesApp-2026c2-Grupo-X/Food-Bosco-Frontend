import { Box, HStack, SimpleGrid, Text, VStack, Link as ChakraLink } from '@chakra-ui/react'
import Tag from '@gravity-ui/icons/Tag'
import Receipt from '@gravity-ui/icons/Receipt'
import BoxIcon from '@gravity-ui/icons/Box'
import ChartColumn from '@gravity-ui/icons/ChartColumn'
import ListUl from '@gravity-ui/icons/ListUl'
import { Link } from 'react-router-dom'
import {
  EmptyState,
  Muted,
  OrderStatusBadge,
  PageTitle,
  PrimaryButton,
  Strong,
  WidePageContainer,
} from '@repo/components'
import { useBranchOrders } from '@repo/api'
import { formatElapsed, getElapsedMinutes, getStatusSince } from '@repo/domain'
import { orderDetailPath, routes } from '../../routes'
import { groupAttentionOrders } from './utils/attention'

const QUICK_ACCESS = [
  {
    id: 'products',
    label: 'Productos',
    description: 'Pausar o reactivar',
    path: routes.products,
    icon: Tag,
  },
  {
    id: 'orders',
    label: 'Pedidos',
    description: 'Operar estados',
    path: routes.orders,
    icon: Receipt,
  },
  {
    id: 'stock',
    label: 'Stock',
    description: 'Ingredientes del almacén',
    path: routes.stock,
    icon: BoxIcon,
  },
  {
    id: 'reports',
    label: 'Reportes',
    description: 'Productos',
    path: routes.reports,
    icon: ChartColumn,
  },
]

const elapsedTone = (minutes: number) =>
  minutes >= 30 ? 'danger' : minutes >= 15 ? 'warning' : 'fg.muted'

export const HomePage = () => {
  const { orders, isLoading } = useBranchOrders()
  const groups = groupAttentionOrders(orders)

  return (
    <WidePageContainer>
      <VStack align="start" gap="1">
        <PageTitle>Inicio</PageTitle>
        <Muted>Gestioná la operación de tu sucursal.</Muted>
      </VStack>

      <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
        {QUICK_ACCESS.map((item) => {
          const Icon = item.icon
          return (
            <ChakraLink
              asChild
              key={item.id}
              display="block"
              bg="bg.panel"
              border="1px solid"
              borderColor="border.subtle"
              borderRadius="2xl"
              padding="5"
              _hover={{ borderColor: 'border.emphasized' }}
            >
              <Link to={item.path}>
                <Box color="brand.600" marginBottom="3">
                  <Icon width={26} height={26} />
                </Box>
                <Strong>{item.label}</Strong>
                <Muted fontSize="sm">{item.description}</Muted>
              </Link>
            </ChakraLink>
          )
        })}
      </SimpleGrid>

      <VStack align="start" gap="4" width="full">
        <Strong fontSize="xl">Pedidos que requieren atención</Strong>
        {!isLoading && groups.length === 0 ? (
          <EmptyState
            icon={<ListUl width={40} height={40} />}
            title="Sin pedidos activos"
            description="No hay pedidos pendientes de operar en este momento."
          />
        ) : (
          <VStack align="stretch" gap="5" width="full">
            {groups.map((group) => (
              <VStack key={group.status} align="stretch" gap="2">
                <HStack gap="2">
                  <OrderStatusBadge status={group.status} />
                  <Muted fontSize="sm">
                    {group.orders.length} {group.orders.length === 1 ? 'pedido' : 'pedidos'}
                  </Muted>
                </HStack>
                {group.orders.map((order) => {
                  const minutes = getElapsedMinutes(getStatusSince(order))
                  return (
                    <HStack
                      key={order.id}
                      justify="space-between"
                      gap="4"
                      bg="bg.panel"
                      border="1px solid"
                      borderColor="border.subtle"
                      borderRadius="2xl"
                      padding="4"
                    >
                      <VStack align="start" gap="1">
                        <Strong>
                          #{order.number} ·{' '}
                          {order.client
                            ? `${order.client.firstName} ${order.client.lastName}`
                            : 'Cliente'}
                        </Strong>
                        <Text fontSize="sm" fontWeight="medium" color={elapsedTone(minutes)}>
                          hace {formatElapsed(getStatusSince(order))}
                        </Text>
                      </VStack>
                      <PrimaryButton asChild size="md">
                        <Link to={orderDetailPath(order.id)}>Ver</Link>
                      </PrimaryButton>
                    </HStack>
                  )
                })}
              </VStack>
            ))}
          </VStack>
        )}
      </VStack>
    </WidePageContainer>
  )
}
