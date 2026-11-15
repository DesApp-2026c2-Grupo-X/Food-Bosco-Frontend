import { useState } from 'react'
import { Alert, HStack, SimpleGrid, VStack } from '@chakra-ui/react'
import {
  Card,
  EmptyState,
  KpiCard,
  LoadingState,
  Muted,
  PageContainer,
  PageHeader,
  SelectField,
  StarRating,
  Strong,
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
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return { from: from.toISOString() }
}

const formatAverage = (value: number): string => value.toFixed(1)

const courierName = (firstName: string | null, lastName: string | null, fallback: string): string => {
  const name = [firstName, lastName].filter(Boolean).join(' ')
  return name || fallback
}

export const RatingsPage = () => {
  const [range, setRange] = useState('30')
  const filter = filterForRange(range)
  const { summary, isLoading: summaryLoading, error: summaryError } = useReviewsSummary(filter)
  const { rows: branchRows, isLoading: branchLoading } = useBranchRatingRanking(filter)
  const { rows: courierRows, isLoading: courierLoading } = useCourierRatingRanking(filter)

  return (
    <PageContainer>
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
              width="200px"
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
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="3">
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
          <Strong fontSize="lg">Ranking de sucursales</Strong>
          <Muted fontSize="sm" marginBottom="3">
            Ordenado por promedio de estrellas.
          </Muted>
          {branchLoading ? (
            <LoadingState variant="list" skeletonCount={3} skeletonHeight="56px" />
          ) : branchRows.length === 0 ? (
            <EmptyState
              title="Sin calificaciones"
              description="Todavía no hay sucursales calificadas en el período."
            />
          ) : (
            <VStack align="stretch" gap="2">
              {branchRows.map((row, index) => (
                <HStack key={row.branchId} justify="space-between" gap="3">
                  <HStack gap="3" minWidth="0">
                    <Muted fontSize="sm" width="20px">
                      {index + 1}
                    </Muted>
                    <Strong truncate>{row.branch?.name ?? row.branchId}</Strong>
                  </HStack>
                  <HStack gap="2">
                    <StarRating
                      value={Math.round(row.averageRating)}
                      readOnly
                      size="sm"
                      label={`Promedio de ${row.branch?.name ?? 'la sucursal'}`}
                    />
                    <Muted fontSize="sm">{formatAverage(row.averageRating)}</Muted>
                    <Muted fontSize="xs">({row.totalReviews})</Muted>
                  </HStack>
                </HStack>
              ))}
            </VStack>
          )}
        </Card>

        <Card>
          <Strong fontSize="lg">Ranking de repartidores</Strong>
          <Muted fontSize="sm" marginBottom="3">
            Ordenado por promedio de estrellas.
          </Muted>
          {courierLoading ? (
            <LoadingState variant="list" skeletonCount={3} skeletonHeight="56px" />
          ) : courierRows.length === 0 ? (
            <EmptyState
              title="Sin calificaciones"
              description="Todavía no hay repartidores calificados en el período."
            />
          ) : (
            <VStack align="stretch" gap="2">
              {courierRows.map((row, index) => (
                <HStack key={row.courierId} justify="space-between" gap="3">
                  <HStack gap="3" minWidth="0">
                    <Muted fontSize="sm" width="20px">
                      {index + 1}
                    </Muted>
                    <Strong truncate>
                      {courierName(
                        row.rider?.firstName ?? null,
                        row.rider?.lastName ?? null,
                        row.courierId,
                      )}
                    </Strong>
                  </HStack>
                  <HStack gap="2">
                    <StarRating
                      value={Math.round(row.averageRating)}
                      readOnly
                      size="sm"
                      label="Promedio del repartidor"
                    />
                    <Muted fontSize="sm">{formatAverage(row.averageRating)}</Muted>
                    <Muted fontSize="xs">({row.totalReviews})</Muted>
                  </HStack>
                </HStack>
              ))}
            </VStack>
          )}
        </Card>
      </SimpleGrid>
    </PageContainer>
  )
}
