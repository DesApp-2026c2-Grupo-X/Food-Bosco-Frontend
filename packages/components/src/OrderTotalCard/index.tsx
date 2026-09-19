import { HStack } from '@chakra-ui/react'
import { formatPrice } from '@repo/domain'
import { Card } from '../Card'
import { Strong } from '../Strong'
import { Price } from '../Price'
import { Subtle } from '../Subtle'
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
