import { HStack } from '@chakra-ui/react'
import { formatPrice } from '@repo/domain'
import { Card } from '../Card'
import { Price, Strong, Subtle } from '../typography'
import type { OrderTotalCardProps } from './types'

export const OrderTotalCard = ({ total, subtitle }: OrderTotalCardProps) => (
  <Card variant="subtle">
    <HStack justify="space-between" marginBottom={subtitle ? '2' : undefined}>
      <Strong>Total</Strong>
      <Price fontWeight="bold" fontSize="xl">
        {formatPrice(total)}
      </Price>
    </HStack>
    {subtitle ? <Subtle fontSize="sm">{subtitle}</Subtle> : null}
  </Card>
)
