import { HStack, Text, VStack } from '@chakra-ui/react'
import { formatPrice } from '@repo/domain'
import { Card } from '../Card'
import { Muted } from '../Muted'
import { Price } from '../Price'
import type { OrderItemsCardProps } from './types'

export const OrderItemsCard = ({ items, title = 'Productos' }: OrderItemsCardProps) => (
  <Card>
    <Muted fontSize="sm" marginBottom="3">
      {title}
    </Muted>
    <VStack gap="3" align="stretch">
      {items.map((item) => (
        <HStack key={item.productId} justify="space-between">
          <Text>
            {item.quantity} × {item.name}
          </Text>
          <Price fontWeight="medium">{formatPrice(item.subtotal)}</Price>
        </HStack>
      ))}
    </VStack>
  </Card>
)
