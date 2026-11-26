import { useMemo, useState } from 'react'
import { Alert, HStack, SimpleGrid, VStack } from '@chakra-ui/react'
import {
  Card,
  EmptyState,
  KpiCard,
  LoadingState,
  Muted,
  PageHeader,
  SelectField,
  StarRating,
  Strong,
  WidePageContainer,
} from '@repo/components'
import {
  getApiErrorMessage,
  useBranchRatingRanking,
  useCourierRatingRanking,
  useReviewsSummary,
} from '@repo/api'
import type { ReviewFilter } from '@repo/api'

const RANGE_OPTIONS = [
  { value: '30', label: 'Últimos 30 días' },
  { value: '90', label: 'Últimos 90 días' },
  { value: '365', label: 'Último año' },
  { value: 'all', label: 'Todo el historial' },
]

const filterForRange = (range: string): ReviewFilter | undefined => {
  if (range === 'all') return undefined
  const days = Number(range)
  const now = new Date()
  now.setSeconds(0, 0)
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return { from: from.toISOString() }
}

const formatAverage = (value: number): string => value.toFixed(1)

const courierName = (
  firstName: string | null,
  lastName: string | null,
  fallback: string,
): string => {
  const name = [firstName, lastName].filter(Boolean).join(' ')
  return name || fallback
}

interface RankingRowProps {
  position: number
  name: string
  averageRating: number
  totalReviews: number
}

const RankingRow = ({ position, name, averageRating, totalReviews }: RankingRowProps) => (
  <HStack justify="space-between" gap="4">
    <HStack gap="3" minWidth="0" flex="1">
      <Muted fontSize="sm" width="24px" flexShrink={0} fontVariantNumeric="tabular-nums">
        {position}
      </Muted>
      <Strong truncate title={name}>
        {name}
      </Strong>
    </HStack>
    <HStack gap="2" flexShrink={0}>
      <StarRating value={averageRating} readOnly size="sm" label={`Promedio de ${name}`} />
      <Muted fontSize="sm" minWidth="28px" textAlign="right" fontVariantNumeric="tabular-nums">
        {formatAverage(averageRating)}
      </Muted>
      <Muted fontSize="xs" minWidth="36px" textAlign="right" fontVariantNumeric="tabular-nums">
        ({totalReviews})
      </Muted>
    </HStack>
  </HStack>
)

export const RatingsPage = () => {
  const [range, setRange] = useState('30')
  const filter = useMemo(() => filterForRange(range), [range])
  const { summary, isLoading: summaryLoading, error: summaryError } = useReviewsSummary(filter)
  const { rows: branchRows, isLoading: branchLoading } = useBranchRatingRanking(filter)
  const { rows: courierRows, isLoading: courierLoading } = useCourierRatingRanking(filter)

  return (
    <WidePageContainer>
      <PageHeader
        title="Calificaciones"
        description="Reputación de sucursales y repartidores en toda la plataforma."
        action={
          <HStack gap="2">
            <SelectField
              value={range}
              onChange={setRange}
              options={RANGE_OPTIONS}
              size="sm"
              width="filterControl"
            />
          </HStack>
        }
      />

      {summaryError ? (
        <Alert.Root status="error" borderRadius="xl">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{getApiErrorMessage(summaryError)}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      ) : null}

      {summaryLoading ? (
        <LoadingState variant="list" skeletonCount={2} skeletonHeight="96px" />
      ) : summary ? (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="4">
          <KpiCard
            title="Promedio de sucursales"
            value={`${formatAverage(summary.branchAverageRating)} ★`}
          />
          <KpiCard title="Calificaciones de sucursales" value={String(summary.branchReviews)} />
          <KpiCard
            title="Promedio de repartidores"
            value={`${formatAverage(summary.courierAverageRating)} ★`}
          />
          <KpiCard title="Calificaciones de repartidores" value={String(summary.courierReviews)} />
        </SimpleGrid>
      ) : null}

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="4">
        <Card>
          <VStack align="stretch" gap="4">
            <VStack align="start" gap="1">
              <Strong fontSize="lg">Ranking de sucursales</Strong>
              <Muted fontSize="sm">Ordenado por promedio de estrellas.</Muted>
            </VStack>
            {branchLoading ? (
              <LoadingState variant="list" skeletonCount={3} skeletonHeight="56px" />
            ) : branchRows.length === 0 ? (
              <EmptyState
                title="Sin calificaciones"
                description="Todavía no hay sucursales calificadas en el período."
              />
            ) : (
              <VStack align="stretch" gap="3">
                {branchRows.map((row, index) => (
                  <RankingRow
                    key={row.branchId}
                    position={index + 1}
                    name={row.branch?.name ?? row.branchId}
                    averageRating={row.averageRating}
                    totalReviews={row.totalReviews}
                  />
                ))}
              </VStack>
            )}
          </VStack>
        </Card>

        <Card>
          <VStack align="stretch" gap="4">
            <VStack align="start" gap="1">
              <Strong fontSize="lg">Ranking de repartidores</Strong>
              <Muted fontSize="sm">Ordenado por promedio de estrellas.</Muted>
            </VStack>
            {courierLoading ? (
              <LoadingState variant="list" skeletonCount={3} skeletonHeight="56px" />
            ) : courierRows.length === 0 ? (
              <EmptyState
                title="Sin calificaciones"
                description="Todavía no hay repartidores calificados en el período."
              />
            ) : (
              <VStack align="stretch" gap="3">
                {courierRows.map((row, index) => (
                  <RankingRow
                    key={row.courierId}
                    position={index + 1}
                    name={courierName(
                      row.rider?.firstName ?? null,
                      row.rider?.lastName ?? null,
                      row.courierId,
                    )}
                    averageRating={row.averageRating}
                    totalReviews={row.totalReviews}
                  />
                ))}
              </VStack>
            )}
          </VStack>
        </Card>
      </SimpleGrid>
    </WidePageContainer>
  )
}
