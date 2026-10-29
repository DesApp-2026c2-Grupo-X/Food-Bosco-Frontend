import { useMemo, useState } from 'react'
import { HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { useCustomerInsights, useCustomerRegistrationStats } from '@repo/api'
import {
  buildReportRange,
  formatOrderDate,
  formatPrice,
  type CustomerInsightRow,
  type CustomerInsightsSort,
  type ReportPeriodPreset,
} from '@repo/domain'
import { Card } from '../Card'
import { CustomerBranchChart } from '../CustomerBranchChart'
import { CustomerBuyerTrendChart } from '../CustomerBuyerTrendChart'
import { CustomerDistributionChart } from '../CustomerDistributionChart'
import { DataTable } from '../DataTable'
import type { DataTableColumn } from '../DataTable/types'
import { EmptyState } from '../feedback'
import { KpiCard } from '../KpiCard'
import { PageHeader } from '../PageHeader'
import { ReportFilters } from '../ReportFilters'
import { SearchInput } from '../SearchInput'
import { SelectField } from '../SelectField'
import { Muted, Strong } from '../typography'
import { WidePageContainer } from '../WidePageContainer'
import type { CustomerInsightsViewProps } from './types'

const SORT_OPTIONS = [
  { value: 'LAST_PURCHASE', label: 'Última compra' },
  { value: 'ORDERS', label: 'Cantidad de pedidos' },
  { value: 'SPENT', label: 'Gasto total' },
]

const formatBuyerLabel = (row: CustomerInsightRow): string => {
  const name = `${row.client?.firstName ?? ''} ${row.client?.lastName ?? ''}`.trim()
  return name || row.client?.email || row.clientId
}

const rowTags = (row: CustomerInsightRow): string[] => {
  const tags: string[] = []
  if (row.isNewOnPlatform) tags.push('Nuevo en la plataforma')
  else if (row.isNew) tags.push('Nuevo en la sucursal')
  if (row.isRecurring) tags.push('Recurrente')
  if (tags.length === 0) tags.push('Ocasional')
  return tags
}

const matchesSearch = (row: CustomerInsightRow, term: string): boolean => {
  if (!term) return true
  const haystack = [row.client?.firstName, row.client?.lastName, row.client?.email, row.clientId]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(term)
}

const sortRows = (rows: CustomerInsightRow[], sortBy: CustomerInsightsSort): CustomerInsightRow[] =>
  [...rows].sort((a, b) => {
    if (sortBy === 'ORDERS') return b.orders - a.orders
    if (sortBy === 'SPENT') return b.totalSpent - a.totalSpent
    return new Date(b.lastPurchaseAt).getTime() - new Date(a.lastPurchaseAt).getTime()
  })

export const CustomerInsightsView = ({
  description,
  scope,
  branchOptions,
}: CustomerInsightsViewProps) => {
  const [preset, setPreset] = useState<ReportPeriodPreset>('month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [branchId, setBranchId] = useState('')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<CustomerInsightsSort>('LAST_PURCHASE')

  const range = useMemo(
    () => buildReportRange(preset, customFrom, customTo),
    [preset, customFrom, customTo],
  )

  const filter = useMemo(
    () => ({
      from: range.from.toISOString(),
      to: range.to.toISOString(),
      groupBy: range.groupBy,
      branchId: scope === 'admin' && branchId ? branchId : undefined,
      sortBy,
      limit: 100,
    }),
    [range, scope, branchId, sortBy],
  )

  const { overview, isLoading, error } = useCustomerInsights(filter)
  const { stats: registrationStats, isLoading: isRegistrationLoading } =
    useCustomerRegistrationStats({ from: filter.from, to: filter.to }, { skip: scope === 'branch' })

  const kpis = overview?.kpis
  const customers = useMemo(() => {
    const term = search.trim().toLowerCase()
    return sortRows(
      (overview?.customers ?? []).filter((row) => matchesSearch(row, term)),
      sortBy,
    )
  }, [overview, search, sortBy])

  const columns: DataTableColumn<CustomerInsightRow>[] = [
    {
      key: 'client',
      header: 'Cliente',
      render: (row) => (
        <VStack align="start" gap="0">
          <Strong fontSize="sm">{formatBuyerLabel(row)}</Strong>
          <Muted fontSize="xs">{row.client?.email ?? row.clientId}</Muted>
        </VStack>
      ),
    },
    {
      key: 'orders',
      header: 'Pedidos',
      render: (row) => <Text>{row.orders}</Text>,
    },
    {
      key: 'spent',
      header: 'Gasto',
      render: (row) => <Text>{formatPrice(row.totalSpent)}</Text>,
    },
    {
      key: 'lastPurchase',
      header: 'Última compra',
      hideBelow: 'md',
      render: (row) => (
        <VStack align="start" gap="0">
          <Text fontSize="sm">{formatOrderDate(row.lastPurchaseAt)}</Text>
          <Muted fontSize="xs">Hace {row.daysSinceLastPurchase} días</Muted>
        </VStack>
      ),
    },
    {
      key: 'tags',
      header: 'Actividad',
      hideBelow: 'lg',
      render: (row) => (
        <HStack gap="2" wrap="wrap">
          {rowTags(row).map((tag) => (
            <Text key={tag} fontSize="xs" color="fg.muted">
              {tag}
            </Text>
          ))}
        </HStack>
      ),
    },
  ]

  return (
    <WidePageContainer>
      <PageHeader title="Reportes de clientes" description={description} />

      <ReportFilters
        preset={preset}
        onPresetChange={setPreset}
        from={customFrom}
        to={customTo}
        onFromChange={setCustomFrom}
        onToChange={setCustomTo}
        branchId={scope === 'admin' ? branchId : undefined}
        onBranchChange={scope === 'admin' ? setBranchId : undefined}
        branches={scope === 'admin' ? branchOptions : undefined}
      />

      {error ? (
        <EmptyState
          title="Error de consulta"
          description="No pudimos cargar los reportes de clientes. Intentá nuevamente en unos minutos."
        />
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="4">
            <KpiCard
              title="Clientes compradores"
              value={String(kpis?.totalBuyers ?? 0)}
              hint="Clientes únicos con compras entregadas"
            />
            <KpiCard
              title="Nuevos compradores"
              value={String(kpis?.newBuyers ?? 0)}
              hint={
                kpis && kpis.totalBuyers > 0
                  ? `${Math.round((kpis.newBuyers / kpis.totalBuyers) * 100)}% del total`
                  : 'Sin compradores en el período'
              }
            />
            <KpiCard
              title="Compradores que regresan"
              value={String(kpis?.returningBuyers ?? 0)}
              hint="Ya habían comprado antes del período"
            />
            <KpiCard
              title="Clientes recurrentes"
              value={String(kpis?.recurringBuyers ?? 0)}
              hint="Dos o más compras entregadas en el período"
            />
            <KpiCard title="Pedidos entregados" value={String(kpis?.totalOrders ?? 0)} />
            <KpiCard title="Ticket promedio" value={formatPrice(kpis?.averageTicket ?? 0)} />
            <KpiCard
              title="Pedidos por cliente"
              value={String(kpis?.averageOrdersPerBuyer ?? 0)}
              hint="Promedio de compras entregadas"
            />
            {scope === 'admin' ? (
              <>
                <KpiCard
                  title="Clientes registrados"
                  value={isRegistrationLoading ? '—' : String(registrationStats?.total ?? 0)}
                  hint="Total histórico de la plataforma"
                />
                <KpiCard
                  title="Nuevos registros"
                  value={isRegistrationLoading ? '—' : String(registrationStats?.newInPeriod ?? 0)}
                  hint="Clientes creados en el período"
                />
              </>
            ) : null}
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap="4">
            <CustomerBuyerTrendChart data={overview?.buyerSeries ?? []} isLoading={isLoading} />
            <CustomerDistributionChart
              title="Distribución por cantidad de pedidos"
              description="Cantidad de clientes según sus compras entregadas en el período."
              emptyDescription="No hay compradores para distribuir en el período."
              data={overview?.frequency ?? []}
              isLoading={isLoading}
            />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap="4">
            <CustomerDistributionChart
              title="Tiempo desde la última compra"
              description="Cantidad de clientes según los días transcurridos desde su última compra entregada."
              emptyDescription="No hay compradores para distribuir en el período."
              data={overview?.recency ?? []}
              isLoading={isLoading}
            />
            {scope === 'admin' ? (
              <CustomerBranchChart data={overview?.branchActivity ?? []} isLoading={isLoading} />
            ) : null}
          </SimpleGrid>

          <Card>
            <VStack align="stretch" gap="4">
              <HStack justify="space-between" wrap="wrap" gap="3">
                <Strong fontSize="lg">Clientes con actividad</Strong>
                <HStack gap="3" wrap="wrap">
                  <SearchInput
                    placeholder="Buscar por nombre o email"
                    value={search}
                    onChange={(event) => setSearch(event.currentTarget.value)}
                    size="sm"
                    maxWidth="64"
                  />
                  <SelectField
                    value={sortBy}
                    onChange={(value) => setSortBy(value as CustomerInsightsSort)}
                    options={SORT_OPTIONS}
                    width="filterControl"
                  />
                </HStack>
              </HStack>
              <DataTable
                columns={columns}
                rows={customers}
                getRowKey={(row) => row.clientId}
                isLoading={isLoading}
                emptyTitle={search ? 'Sin coincidencias' : 'Sin clientes compradores'}
                emptyDescription={
                  search
                    ? 'No encontramos clientes que coincidan con la búsqueda.'
                    : 'No se registraron compras entregadas en el período seleccionado.'
                }
              />
              <Muted fontSize="xs">
                Se muestran hasta 100 clientes ordenados por el criterio seleccionado. Solo se
                consideran pedidos entregados.
              </Muted>
            </VStack>
          </Card>
        </>
      )}
    </WidePageContainer>
  )
}
