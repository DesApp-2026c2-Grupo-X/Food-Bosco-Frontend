import { useState } from 'react'
import { Alert, HStack } from '@chakra-ui/react'
import {
  PageContainer,
  PageHeader,
  ReviewStatsPanel,
  SelectField,
} from '@repo/components'
import { getApiErrorMessage, useBranchReviewStats } from '@repo/api'
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

export const RatingsPage = () => {
  const [range, setRange] = useState('30')
  const { stats, isLoading, error } = useBranchReviewStats(undefined, filterForRange(range))

  return (
    <PageContainer>
      <PageHeader
        title="Calificaciones"
        description="Opiniones de los clientes sobre tu sucursal."
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

      {error ? (
        <Alert.Root status="error" borderRadius="xl">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{getApiErrorMessage(error)}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      ) : (
        <ReviewStatsPanel
          stats={stats}
          isLoading={isLoading}
          title="Promedio de la sucursal"
          description="calificaciones de sucursal"
          emptyDescription="Cuando los clientes califiquen sus pedidos entregados, las opiniones van a aparecer acá."
        />
      )}
    </PageContainer>
  )
}
