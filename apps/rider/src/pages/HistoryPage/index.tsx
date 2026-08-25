import { Box, Spinner, VStack } from '@chakra-ui/react'
import Receipt from '@gravity-ui/icons/Receipt'
import { EmptyState, Muted, PageTitle, PageContainer } from '@repo/components'
import { useMyTrips } from '@repo/api'
import { TripCard } from '../../components/TripCard'

export const HistoryPage = () => {
  const { trips, isLoading } = useMyTrips()

  return (
    <PageContainer>
      <VStack align="start" gap="1">
        <PageTitle>Historial de viajes</PageTitle>
        <Muted>Tus viajes completados.</Muted>
      </VStack>

      {isLoading ? (
        <Box paddingY="24" display="flex" justifyContent="center">
          <Spinner size="lg" color="brand.600" />
        </Box>
      ) : trips.length === 0 ? (
        <EmptyState
          icon={<Receipt width={40} height={40} />}
          title="Todavía no realizaste viajes"
          description="Cuando completes tu primer viaje, va a aparecer acá."
        />
      ) : (
        <VStack align="stretch" gap="3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </VStack>
      )}
    </PageContainer>
  )
}
