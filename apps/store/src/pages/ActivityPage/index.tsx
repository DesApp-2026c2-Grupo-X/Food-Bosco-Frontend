import { useMemo, useState } from 'react'
import { HStack, SimpleGrid, VStack } from '@chakra-ui/react'
import ChartColumn from '@gravity-ui/icons/ChartColumn'
import { Link } from 'react-router-dom'
import {
  Card,
  Chip,
  CustomerActivityChart,
  EmptyState,
  KpiCard,
  LoadingState,
  Muted,
  OrderStatusChart,
  PageContainer,
  PageHeader,
  Price,
  PrimaryButton,
  SecondaryButton,
  Strong,
  TextLink,
} from '@repo/components'
import { useCustomerReports } from '@repo/api'
import {
  CUSTOMER_REPORT_PERIOD_OPTIONS,
  buildCustomerReportRange,
  formatPrice,
  type CustomerReportPreset,
} from '@repo/domain'
import { routes } from '../../routes'

export const ActivityPage = () => {
  const [preset, setPreset] = useState<CustomerReportPreset>('year')
  const range = useMemo(() => buildCustomerReportRange(preset), [preset])

  const { overview, isLoading, error, refetch } = useCustomerReports({
    from: range.from.toISOString(),
    to: range.to.toISOString(),
    groupBy: range.groupBy,
  })

  const summary = overview?.summary
  const hasActivity = (summary?.totalOrders ?? 0) > 0

  return (
    <PageContainer>
      <PageHeader
        title="Mi actividad"
        description="Un resumen claro de tus compras, pedidos y gustos en Food-Bosco."
      />

      <HStack gap="2" wrap="wrap">
        {CUSTOMER_REPORT_PERIOD_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            active={preset === option.value}
            onClick={() => setPreset(option.value)}
          />
        ))}
      </HStack>

      {isLoading ? <LoadingState variant="list" skeletonCount={4} skeletonHeight="88px" /> : null}

      {!isLoading && error ? (
        <EmptyState
          title="No pudimos cargar tu actividad"
          description="Revisá tu conexión e intentá nuevamente en unos minutos."
          action={<SecondaryButton onClick={refetch}>Reintentar</SecondaryButton>}
        />
      ) : null}

      {!isLoading && !error && overview && !hasActivity ? (
        <EmptyState
          icon={<ChartColumn width={40} height={40} />}
          title="Todavía no tenés actividad"
          description="Cuando hagas tu primer pedido, vas a ver acá tus compras, gustos y evolución."
          action={
            <PrimaryButton asChild>
              <Link to={routes.catalog}>Ir al catálogo</Link>
            </PrimaryButton>
          }
        />
      ) : null}

      {!isLoading && !error && overview && summary && hasActivity ? (
        <>
          <SimpleGrid columns={{ base: 2, lg: 4 }} gap="4">
            <KpiCard
              title="Compras completadas"
              value={String(summary.completedOrders)}
              hint="Pedidos entregados"
            />
            <KpiCard
              title="Total invertido"
              value={formatPrice(summary.totalSpent)}
              hint="Solo pedidos entregados"
            />
            <KpiCard
              title="Ticket promedio"
              value={formatPrice(summary.averageTicket)}
              hint="Por compra completada"
            />
            <KpiCard
              title="Pedidos en curso"
              value={String(summary.activeOrders)}
              hint="En preparación o en camino"
            />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap="4">
            <CustomerActivityChart data={overview.activitySeries} isLoading={false} />
            <OrderStatusChart data={overview.ordersByStatus} isLoading={false} />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap="4">
            <Card>
              <VStack align="stretch" gap="3">
                <Strong fontSize="lg">Productos que más pedís</Strong>
                {overview.frequentProducts.length === 0 ? (
                  <Muted>
                    Todavía no completaste compras. Cuando recibas tu primer pedido, acá vas a ver
                    tus productos favoritos.
                  </Muted>
                ) : (
                  <VStack align="stretch" gap="2">
                    {overview.frequentProducts.map((product) => (
                      <HStack key={product.productId} justify="space-between" gap="3">
                        <VStack align="start" gap="0">
                          <Strong fontSize="sm">{product.name}</Strong>
                          <Muted fontSize="xs">
                            {product.quantity} unidades ·{' '}
                            {product.orders === 1 ? '1 pedido' : `${product.orders} pedidos`}
                          </Muted>
                        </VStack>
                        <Price>{formatPrice(product.totalSpent)}</Price>
                      </HStack>
                    ))}
                  </VStack>
                )}
                <Muted fontSize="xs">Calculado con tus pedidos entregados.</Muted>
              </VStack>
            </Card>

            <Card>
              <VStack align="stretch" gap="3">
                <Strong fontSize="lg">Dónde comprás más</Strong>
                {summary.favoriteBranch ? (
                  <VStack align="start" gap="1">
                    <Strong fontSize="md">{summary.favoriteBranch.branchName}</Strong>
                    <Muted fontSize="sm">
                      {summary.favoriteBranch.orders === 1
                        ? '1 compra completada'
                        : `${summary.favoriteBranch.orders} compras completadas`}{' '}
                      · {formatPrice(summary.favoriteBranch.totalSpent)}
                    </Muted>
                  </VStack>
                ) : (
                  <Muted>
                    Todavía no hay compras completadas para calcular tu sucursal favorita.
                  </Muted>
                )}
                <TextLink to={routes.orders} fontSize="sm">
                  Ver historial completo
                </TextLink>
              </VStack>
            </Card>
          </SimpleGrid>
        </>
      ) : null}
    </PageContainer>
  )
}
