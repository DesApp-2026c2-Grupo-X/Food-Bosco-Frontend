import { Box, HStack, Spinner, VStack } from '@chakra-ui/react'
import Route from '@gravity-ui/icons/Route'
import { useCallback } from 'react'
import { EmptyState, Muted, PageTitle, WidePageContainer } from '@repo/components'
import { useActiveTrip, useRiderProfile, useTripOffers } from '@repo/api'
import { TripOfferCard } from '../../components/TripOfferCard'
import { useRiderLocation } from '../../hooks/useRiderLocation'
import { useRiderStore } from '../../stores/riderStore'
import { ActiveTrip } from './ActiveTrip'

export const HomePage = () => {
  const isOnline = useRiderStore((state) => state.isOnline)
  const { offer, isLoading, isMutating, accept, reject } = useTripOffers()
  const {
    trip,
    isLoading: tripLoading,
    isMutating: tripMutating,
    pickup,
    deliver,
  } = useActiveTrip()
  const { profile, updateLocation } = useRiderProfile()
  useRiderLocation(isOnline, updateLocation)

  const handleAccept = useCallback(async () => {
    if (!offer) return
    await accept(offer.id)
  }, [offer, accept])

  const handleReject = useCallback(() => {
    if (!offer) return
    void reject(offer.id)
  }, [offer, reject])

  const handlePickup = useCallback(
    (orderId: string) => {
      void pickup(orderId)
    },
    [pickup],
  )

  const handleDeliver = useCallback(
    async (orderId: string) => {
      await deliver(orderId)
    },
    [deliver],
  )

  if (isLoading || tripLoading) {
    return (
      <Box paddingY="24" display="flex" justifyContent="center">
        <Spinner size="lg" color="brand.600" />
      </Box>
    )
  }

  if (trip) {
    return (
      <ActiveTrip
        trip={trip}
        isMutating={tripMutating}
        profile={profile}
        onPickup={handlePickup}
        onDeliver={handleDeliver}
      />
    )
  }

  return (
    <WidePageContainer>
      <VStack align="start" gap="1">
        <PageTitle>Inicio</PageTitle>
        <Muted>Recibí y ejecutá viajes de entrega.</Muted>
      </VStack>

      <HStack gap="2">
        <Box width="2" height="2" borderRadius="full" bg={isOnline ? 'success' : 'fg.subtle'} />
        <Muted fontSize="sm">
          {isOnline ? 'Compartiendo ubicación' : 'Desconectado — no recibís viajes'}
        </Muted>
      </HStack>

      {!isOnline ? (
        <EmptyState
          title="Estás desconectado"
          description="Activá la disponibilidad para empezar a recibir viajes cerca tuyo."
        />
      ) : offer ? (
        <TripOfferCard
          offer={offer}
          isLoading={isMutating}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      ) : (
        <EmptyState
          icon={<Route width={40} height={40} />}
          title="Buscando viajes cerca tuyo…"
          description="Te avisamos ni bien haya una entrega disponible en tu zona."
        />
      )}
    </WidePageContainer>
  )
}
