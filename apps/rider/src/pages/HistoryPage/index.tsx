import { VStack } from '@chakra-ui/react'
import Receipt from '@gravity-ui/icons/Receipt'
import { EmptyState, LoadingState, PageHeader, PageContainer } from '@repo/components'
import { useMyTrips } from '@repo/api'
import { TripCard } from '../../components/TripCard'

export const HistoryPage = () => {
  const { trips, isLoading } = useMyTrips()
  const completed = trips.filter((trip) => trip.status === 'COMPLETED')

  return (
    <PageContainer>
      <PageHeader title="Historial de viajes" description="Tus viajes completados." />

      {isLoading ? (
        <LoadingState />
      ) : completed.length === 0 ? (
        <EmptyState
          icon={<Receipt width={40} height={40} />}
          title="Todavía no realizaste viajes"
          description="Cuando completes tu primer viaje, va a aparecer acá."
        />
      ) : (
        <VStack align="stretch" gap="3">
          {completed.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </VStack>
      )}
    </PageContainer>
  )
}
