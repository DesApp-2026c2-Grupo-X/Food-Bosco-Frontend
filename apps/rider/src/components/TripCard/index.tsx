import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { Price, SummaryCard } from '@repo/components'
import { TRIP_STATUS_LABELS, formatOrderDate, formatPrice } from '@repo/domain'
import type { TripCardProps } from './types'

export const TripCard = ({ trip }: TripCardProps) => {
  const orderCount = trip.orders.length
  const distance = trip.distanceKm

  return (
    <SummaryCard
      title={trip.completedAt ? formatOrderDate(trip.completedAt) : '—'}
      meta={`${orderCount} ${orderCount === 1 ? 'orden' : 'órdenes'}${
        distance != null ? ` · ${distance} km` : ''
      }`}
      trailing={
        <VStack align="end" gap="1">
          <Price fontSize="lg">{formatPrice(trip.earnings ?? 0)}</Price>
          <HStack gap="1.5" color="success">
            <Box width="6px" height="6px" borderRadius="full" bg="currentColor" />
            <Text fontSize="xs" fontWeight="medium">
              {TRIP_STATUS_LABELS.COMPLETED}
            </Text>
          </HStack>
        </VStack>
      }
    />
  )
}
