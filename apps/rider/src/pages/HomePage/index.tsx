import { Box, HStack } from '@chakra-ui/react'
import Route from '@gravity-ui/icons/Route'
import { Navigate } from 'react-router-dom'
import { EmptyState, LoadingState, Muted, PageHeader, WidePageContainer } from '@repo/components'
import { TripOfferCard } from '../../components/TripOfferCard'
import { useRiderHome } from '../../hooks/useRiderHome'
import { tripOrderDetailPath } from '../../routes'

export const HomePage = () => {
  const {
    isOnline,
    visibleOffer,
    isLoading,
    isMutating,
    trip,
    tripLoading,
    handleAccept,
    handleReject,
  } = useRiderHome()

  if (isLoading || tripLoading) {
    return <LoadingState />
  }

  if (trip) {
    const nextOrder = trip.orders.find((order) => order.status !== 'DELIVERED')
    if (nextOrder) {
      return <Navigate to={tripOrderDetailPath(nextOrder.orderId)} replace />
    }
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
