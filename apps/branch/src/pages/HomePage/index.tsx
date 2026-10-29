import { useState } from 'react'
import { HStack, Text, VStack } from '@chakra-ui/react'
import Tag from '@gravity-ui/icons/Tag'
import Receipt from '@gravity-ui/icons/Receipt'
import BoxIcon from '@gravity-ui/icons/Box'
import ChartColumn from '@gravity-ui/icons/ChartColumn'
import ListUl from '@gravity-ui/icons/ListUl'
import { Link } from 'react-router-dom'
import {
  AdjustStockModal,
  Card,
  EmptyState,
  LoadingState,
  LowStockAlertsSection,
  Muted,
  OrderStatusBadge,
  PageHeader,
  PrimaryButton,
  QuickAccessGrid,
  Reveal,
  Strong,
  WidePageContainer,
  notifyWarning,
} from '@repo/components'
import { useBranchOrders, useBranchStock } from '@repo/api'
import {
  filterLowStockAlerts,
  formatElapsedAgo,
  getElapsedMinutes,
  getStatusSince,
  groupAttentionOrders,
  type BranchStock,
} from '@repo/domain'
import { orderDetailPath, routes } from '../../routes'

const QUICK_ACCESS = [
  {
    id: 'products',
    label: 'Productos',
    description: 'Pausar o reactivar',
    path: routes.products,
    icon: Tag,
  },
  {
    id: 'orders',
    label: 'Pedidos',
    description: 'Operar estados',
    path: routes.orders,
    icon: Receipt,
  },
  {
    id: 'stock',
    label: 'Stock',
    description: 'Ingredientes del almacén',
    path: routes.stock,
    icon: BoxIcon,
  },
  {
    id: 'reports',
    label: 'Reportes',
    description: 'Productos',
    path: routes.reports,
    icon: ChartColumn,
  },
]

const elapsedTone = (minutes: number) =>
  minutes >= 30 ? 'danger' : minutes >= 15 ? 'warning' : 'fg.muted'

export const HomePage = () => {
  const { orders, isLoading } = useBranchOrders()
  const { stock = [], isAdjusting = false, adjust } = useBranchStock?.() ?? {}
  const [selectedStock, setSelectedStock] = useState<BranchStock | null>(null)

  const groups = groupAttentionOrders(orders)
  const alerts = filterLowStockAlerts(stock)

  const handleAdjust = async (delta: number, reason: string) => {
    if (!selectedStock) return
    await adjust(selectedStock.ingredientId, delta, reason)
    const minQuantity = selectedStock.ingredient?.minQuantity ?? 0
    const newQuantity = selectedStock.quantity + delta
    if (minQuantity > 0 && newQuantity <= minQuantity) {
      notifyWarning({
        title: 'Stock en alerta',
        description: `${selectedStock.ingredient?.name ?? 'El ingrediente'} quedó con ${newQuantity} ${selectedStock.ingredient?.unit ?? ''} (mínimo: ${minQuantity}).`,
      })
    }
    setSelectedStock(null)
  }

  return (
    <WidePageContainer>
      <PageHeader title="Inicio" description="Gestioná la operación de tu sucursal." />

      <Reveal>
        <QuickAccessGrid items={QUICK_ACCESS} />
      </Reveal>

      {alerts.length > 0 ? (
        <Reveal delayMs={40}>
          <LowStockAlertsSection
            alerts={alerts}
            isAdjusting={isAdjusting}
            stockPath={routes.stock}
            onAdjust={setSelectedStock}
          />
        </Reveal>
      ) : null}

      <Reveal delayMs={60}>
        <VStack align="start" gap="4" width="full">
          <Strong fontSize="xl">Pedidos que requieren atención</Strong>
          {isLoading ? (
            <LoadingState variant="list" skeletonCount={2} skeletonHeight="88px" />
          ) : groups.length === 0 ? (
            <EmptyState
              icon={<ListUl width={40} height={40} />}
              title="Sin pedidos activos"
              description="No hay pedidos pendientes de operar en este momento."
            />
          ) : (
            <VStack align="stretch" gap="5" width="full">
              {groups.map((group) => (
                <VStack key={group.status} align="stretch" gap="2">
                  <HStack gap="2">
                    <OrderStatusBadge status={group.status} />
                    <Muted fontSize="sm">
                      {group.orders.length} {group.orders.length === 1 ? 'pedido' : 'pedidos'}
                    </Muted>
                  </HStack>
                  {group.orders.map((order) => {
                    const minutes = getElapsedMinutes(getStatusSince(order))
                    return (
                      <Card
                        key={order.id}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        gap="4"
                        padding="4"
                      >
                        <VStack align="start" gap="1">
                          <Strong>
                            #{order.number} ·{' '}
                            {order.client
                              ? `${order.client.firstName} ${order.client.lastName}`
                              : 'Cliente'}
                          </Strong>
                          <Text fontSize="sm" fontWeight="medium" color={elapsedTone(minutes)}>
                            {formatElapsedAgo(getStatusSince(order))}
                          </Text>
                        </VStack>
                        <PrimaryButton asChild size="md">
                          <Link to={orderDetailPath(order.id)}>Ver</Link>
                        </PrimaryButton>
                      </Card>
                    )
                  })}
                </VStack>
              ))}
            </VStack>
          )}
        </VStack>
      </Reveal>

      <AdjustStockModal
        ingredient={selectedStock}
        isSubmitting={isAdjusting}
        onClose={() => setSelectedStock(null)}
        onSubmit={handleAdjust}
      />
    </WidePageContainer>
  )
}
