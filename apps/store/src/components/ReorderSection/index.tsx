import { useState } from 'react'
import { HStack, SimpleGrid, VStack } from '@chakra-ui/react'
import {
  Card,
  Muted,
  Price,
  SecondaryButton,
  SectionHeader,
  Strong,
  TextLink,
} from '@repo/components'
import { formatOrderDate, formatPrice, type HomeFeedReorder } from '@repo/domain'
import { routes } from '../../routes'
import { RepeatOrderModal } from '../RepeatOrderModal'
import { summarizeOrderItems } from './utils/summarizeOrderItems'
import type { ReorderSectionProps } from './types'

export const ReorderSection = ({ orders }: ReorderSectionProps) => {
  const [orderToRepeat, setOrderToRepeat] = useState<HomeFeedReorder | null>(null)

  if (orders.length === 0) return null

  return (
    <VStack align="stretch" gap="6">
      <SectionHeader
        label="Tu historial"
        title="Volvé a pedir"
        action={
          <TextLink to={routes.orders} fontSize="sm">
            Ver mis pedidos
          </TextLink>
        }
      />

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
        {orders.map((order) => {
          const itemCount = order.items.reduce((total, item) => total + item.quantity, 0)

          return (
            <Card key={order.id}>
              <VStack align="stretch" gap="1">
                <Strong fontSize="lg">Pedido #{order.number}</Strong>
                <Muted fontSize="sm">
                  {order.branch?.name ?? 'Sucursal'} · {formatOrderDate(order.createdAt)}
                </Muted>
              </VStack>

              <Muted fontSize="sm" marginTop="3" lineClamp={2}>
                {summarizeOrderItems(order)}
              </Muted>

              <HStack justify="space-between" align="end" marginTop="4" gap="3">
                <VStack align="start" gap="0">
                  <Muted fontSize="xs">
                    {itemCount} {itemCount === 1 ? 'ítem' : 'ítems'}
                  </Muted>
                  <Price>{formatPrice(order.total)}</Price>
                </VStack>
                <SecondaryButton size="sm" onClick={() => setOrderToRepeat(order)}>
                  Repetir
                </SecondaryButton>
              </HStack>
            </Card>
          )
        })}
      </SimpleGrid>

      <Muted fontSize="xs">
        Revisamos la disponibilidad y los precios actuales antes de armar tu carrito.{' '}
        <TextLink to={routes.orders} fontSize="xs">
          Ver detalle de tus pedidos
        </TextLink>
      </Muted>

      {orderToRepeat ? (
        <RepeatOrderModal order={orderToRepeat} onClose={() => setOrderToRepeat(null)} />
      ) : null}
    </VStack>
  )
}
