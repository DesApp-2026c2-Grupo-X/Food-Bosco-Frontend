import { Box, HStack } from '@chakra-ui/react'
import Route from '@gravity-ui/icons/Route'
import { EmptyState, LoadingState, Muted, PageHeader, WidePageContainer } from '@repo/components'
import { TripOfferCard } from '../../components/TripOfferCard'
import { useRiderHome } from '../../hooks/useRiderHome'
import { ActiveTrip } from './ActiveTrip'

export const HomePage = () => {
  const {
    isOnline,
    visibleOffer,
    isLoading,
    isMutating,
    trip,
    tripLoading,
    tripMutating,
    riderLocation,
    handleAccept,
    handleReject,
    handlePickup,
    handleDeliver,
  } = useRiderHome()

  if (isLoading || tripLoading) {
    return <LoadingState />
  }

  if (trip) {
    return (
      <ActiveTrip
        trip={trip}
        isMutating={tripMutating}
        riderLocation={riderLocation}
        onPickup={handlePickup}
        onDeliver={handleDeliver}
      />
    )
  }

  return (
    <WidePageContainer>
      <PageHeader title="Inicio" description="Recibí y ejecutá viajes de entrega." />

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
      ) : visibleOffer ? (
        <TripOfferCard
          offer={visibleOffer}
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
