import { Box, HStack } from '@chakra-ui/react'
import { formatPrice } from '@repo/domain'
import { Strong } from '../Strong'
import { Price } from '../Price'
import { Subtle } from '../Subtle'
import type { OrderTotalCardProps } from './types'

export const OrderTotalCard = ({ total, subtitle }: OrderTotalCardProps) => (
  <Box bg="bg.subtle" border="1px solid" borderColor="border.subtle" borderRadius="2xl" padding="5">
    <HStack justify="space-between" marginBottom={subtitle ? '2' : undefined}>
      <Strong>Total</Strong>
      <Price fontWeight="bold" fontSize="xl">
        {formatPrice(total)}
      </Price>
    </HStack>
    {subtitle ? <Subtle fontSize="sm">{subtitle}</Subtle> : null}
  </Box>
)
