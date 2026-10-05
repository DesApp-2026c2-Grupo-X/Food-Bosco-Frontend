import { useMemo, useState } from 'react'
import { SimpleGrid, VStack } from '@chakra-ui/react'
import { useReportsOverview } from '@repo/api'
import {
  ORDER_STATUS_OPTIONS,
  buildReportRange,
  formatPrice,
  type OrderStatus,
  type ReportFilter,
  type ReportPeriodPreset,
} from '@repo/domain'
import { BranchComparisonChart } from '../BranchComparisonChart'
import { Card } from '../Card'
import { EmptyState } from '../feedback'
import { KpiCard } from '../KpiCard'
import { OrderStatusChart } from '../OrderStatusChart'
import { PageHeader } from '../PageHeader'
import { ProductReportsView } from '../ProductReportsView'
import { ReportFilters } from '../ReportFilters'
import { SalesTrendChart } from '../SalesTrendChart'
import { Strong } from '../typography'
import { WidePageContainer } from '../WidePageContainer'
import type { AdvancedReportsViewProps } from './types'

const STATUS_OPTIONS = ORDER_STATUS_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}))

export const AdvancedReportsView = ({
  description,
  scope,
  branchOptions,
}: AdvancedReportsViewProps) => {
  const [preset, setPreset] = useState<ReportPeriodPreset>('month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [branchId, setBranchId] = useState('')
  const [status, setStatus] = useState('')

  const range = useMemo(
    () => buildReportRange(preset, customFrom, customTo),
    [preset, customFrom, customTo],
  )

  const filter = useMemo<ReportFilter>(
    () => ({
      from: range.from.toISOString(),
      to: range.to.toISOString(),
      groupBy: range.groupBy,
      branchId: scope === 'admin' && branchId ? branchId : undefined,
      status: status ? (status as OrderStatus) : undefined,
    }),
    [range, scope, branchId, status],
  )

  const { overview, isLoading, error } = useReportsOverview(filter)
  const kpis = overview?.kpis

  return (
    <WidePageContainer>
      <PageHeader title="Reportes" description={description} />

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
        status={status}
        onStatusChange={setStatus}
        statusOptions={STATUS_OPTIONS}
      />

      {error ? (
        <EmptyState
          title="Error de consulta"
          description="No pudimos cargar los reportes. Intentá nuevamente en unos minutos."
        />
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="4">
            <KpiCard
              title="Ingresos"
              value={formatPrice(kpis?.totalRevenue ?? 0)}
              variation={overview?.variation.revenuePct ?? null}
            />
            <KpiCard
              title="Pedidos"
              value={String(kpis?.totalOrders ?? 0)}
              variation={overview?.variation.ordersPct ?? null}
            />
            <KpiCard
              title="Ticket promedio"
              value={formatPrice(kpis?.averageTicket ?? 0)}
              variation={overview?.variation.averageTicketPct ?? null}
            />
            <KpiCard title="Pedidos cancelados" value={String(kpis?.cancelledOrders ?? 0)} />
            <KpiCard
              title="Producto más vendido"
              value={kpis?.bestSellingProduct?.name ?? '—'}
              hint={
                kpis?.bestSellingProduct
                  ? `${kpis.bestSellingProduct.quantity} unidades`
                  : undefined
              }
            />
            {scope === 'admin' ? (
              <KpiCard
                title="Sucursal con mayor facturación"
                value={kpis?.topBranch?.branchName ?? '—'}
                hint={kpis?.topBranch ? formatPrice(kpis.topBranch.revenue) : undefined}
              />
            ) : null}
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap="4">
            <SalesTrendChart data={overview?.salesSeries ?? []} isLoading={isLoading} />
            <OrderStatusChart data={overview?.ordersByStatus ?? []} isLoading={isLoading} />
          </SimpleGrid>

          {scope === 'admin' ? (
            <BranchComparisonChart data={overview?.branchPerformance ?? []} isLoading={isLoading} />
          ) : null}

          <Card>
            <VStack align="stretch" gap="4">
              <Strong fontSize="lg">Ranking de productos</Strong>
              <ProductReportsView description={description} filter={filter} embedded />
            </VStack>
          </Card>
        </>
      )}
    </WidePageContainer>
  )
}
