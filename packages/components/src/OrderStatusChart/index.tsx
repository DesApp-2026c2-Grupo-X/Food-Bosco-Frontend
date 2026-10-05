import { VStack } from '@chakra-ui/react'
import { ORDER_STATUS_LABELS } from '@repo/domain'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card } from '../Card'
import { STATUS_COLORS } from '../charts/colors'
import { EmptyState, LoadingState } from '../feedback'
import { Muted, Strong } from '../typography'
import type { OrderStatusChartProps } from './types'

export const OrderStatusChart = ({ data, isLoading }: OrderStatusChartProps) => {
  const chartData = data
    .filter((entry) => entry.count > 0)
    .map((entry) => ({
      status: entry.status,
      name: ORDER_STATUS_LABELS[entry.status],
      value: entry.count,
    }))

  return (
    <Card>
      <VStack align="stretch" gap="3">
        <Strong fontSize="lg">Pedidos por estado</Strong>
        {isLoading ? (
          <LoadingState variant="skeleton" skeletonCount={1} skeletonHeight="280px" />
        ) : chartData.length === 0 ? (
          <EmptyState
            title="Sin datos"
            description="No hay pedidos para el período seleccionado."
          />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
        <Muted fontSize="xs">Distribución de pedidos según su estado actual.</Muted>
      </VStack>
    </Card>
  )
}
