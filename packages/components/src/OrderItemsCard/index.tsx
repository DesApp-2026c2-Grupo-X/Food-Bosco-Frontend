import { HStack, Text, VStack } from '@chakra-ui/react'
import { formatPrice } from '@repo/domain'
import { Card } from '../Card'
import { Muted, Price } from '../typography'
import type { OrderItemsCardProps } from './types'

export const OrderItemsCard = ({ items, title = 'Productos' }: OrderItemsCardProps) => (
  <Card>
    <Muted fontSize="sm" marginBottom="3">
      {title}
    </Muted>
    <VStack gap="3" align="stretch">
      {items.map((item, index) => (
        <VStack key={item.key ?? `${item.productId}-${index}`} gap="0.5" align="stretch">
          <HStack justify="space-between" align="start">
            <Text>
              {item.quantity} × {item.name}
            </Text>
            <Price fontWeight="medium">{formatPrice(item.subtotal)}</Price>
          </HStack>
          {item.options && item.options.length > 0 ? (
            <Muted fontSize="sm">{item.options.map((option) => option.name).join(' · ')}</Muted>
          ) : null}
          {item.observations ? (
            <Muted fontSize="sm" fontStyle="italic">
              {`“${item.observations}”`}
            </Muted>
          ) : null}
        </VStack>
      ))}
    </VStack>
  </Card>
)
