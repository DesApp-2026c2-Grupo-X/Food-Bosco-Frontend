import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import Clock from '@gravity-ui/icons/Clock'
import { Eyebrow, GhostButton, Muted, Price, PrimaryButton, Strong } from '@repo/components'
import { formatPrice } from '@repo/domain'
import { useOfferCountdown } from './hooks/useOfferCountdown'
import type { TripOfferCardProps } from './types'

const formatCountdown = (total: number) => {
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export const TripOfferCard = ({ offer, isLoading, onAccept, onReject }: TripOfferCardProps) => {
  const remaining = useOfferCountdown(offer.expiresAt, onReject)
  const orderCount = offer.orderCount

  return (
    <Box
      bg="bg.panel"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="2xl"
      overflow="hidden"
    >
      <Box padding="5">
        <VStack align="stretch" gap="4">
          <VStack align="start" gap="1">
            <Eyebrow>Nueva oferta de viaje</Eyebrow>
            <Strong fontSize="xl">
              {orderCount} {orderCount === 1 ? 'orden' : 'órdenes'} · {offer.distanceKm} km · ~
              {offer.estimatedMinutes} min
            </Strong>
          </VStack>

          <HStack justify="space-between" align="flex-end">
            <VStack align="start" gap="0.5">
              <Muted fontSize="sm">Ganancia estimada</Muted>
              <Price fontSize="3xl" fontWeight="bold">
                {formatPrice(offer.estimatedEarnings)}
              </Price>
            </VStack>
            {offer.expiresAt ? (
              <HStack gap="1.5" color={remaining <= 10 ? 'danger' : 'fg.muted'}>
                <Clock width={16} height={16} />
                <Text fontSize="sm" fontWeight="semibold" fontVariantNumeric="tabular-nums">
                  {formatCountdown(remaining)}
                </Text>
              </HStack>
            ) : null}
          </HStack>

          <HStack gap="2">
            <PrimaryButton flex="1" onClick={onAccept} loading={isLoading}>
              Aceptar
            </PrimaryButton>
            <GhostButton onClick={onReject} disabled={isLoading}>
              Rechazar
            </GhostButton>
          </HStack>
        </VStack>
      </Box>
    </Box>
  )
}
