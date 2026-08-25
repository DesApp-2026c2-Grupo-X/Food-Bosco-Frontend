import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { Muted, Price, Strong } from '@repo/components'
import { formatOrderDate, formatPrice } from '@repo/domain'
import type { TripCardProps } from './types'

export const TripCard = ({ trip }: TripCardProps) => {
  const orderCount = trip.orders.length
  const distance = trip.distanceKm

  return (
    <Box
      bg="bg.panel"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="2xl"
      padding="4"
    >
      <HStack justify="space-between" align="flex-start" gap="4">
        <VStack align="start" gap="1">
          <Strong>{trip.completedAt ? formatOrderDate(trip.completedAt) : '—'}</Strong>
          <Muted fontSize="sm">
            {orderCount} {orderCount === 1 ? 'orden' : 'órdenes'}
            {distance != null ? ` · ${distance} km` : ''}
          </Muted>
        </VStack>
        <VStack align="end" gap="1">
          <Price fontSize="lg">{formatPrice(trip.earnings ?? 0)}</Price>
          <HStack gap="1.5" color="success">
            <Box width="6px" height="6px" borderRadius="full" bg="currentColor" />
            <Text fontSize="xs" fontWeight="medium">
              Completado
            </Text>
          </HStack>
        </VStack>
      </HStack>
    </Box>
  )
}
