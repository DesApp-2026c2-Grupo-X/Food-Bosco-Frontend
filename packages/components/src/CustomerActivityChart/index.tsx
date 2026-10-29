import { VStack } from '@chakra-ui/react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '../Card'
import { CHART_COLORS } from '../charts/colors'
import { EmptyState, LoadingState } from '../feedback'
import { Muted, Strong } from '../typography'
import type { CustomerActivityChartProps } from './types'

export const CustomerActivityChart = ({ data, isLoading }: CustomerActivityChartProps) => (
  <Card>
    <VStack align="stretch" gap="3">
      <Strong fontSize="lg">Evolución de tus compras</Strong>
      {isLoading ? (
        <LoadingState variant="skeleton" skeletonCount={1} skeletonHeight="280px" />
      ) : data.length === 0 ? (
        <EmptyState
          title="Sin compras completadas"
          description="Cuando recibas tu primer pedido, acá vas a ver cómo evoluciona tu actividad."
        />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="bucket" stroke={CHART_COLORS.axis} fontSize={12} />
            <YAxis
              yAxisId="spent"
              stroke={CHART_COLORS.axis}
              fontSize={12}
              width={48}
            />
            <YAxis
              yAxisId="orders"
              orientation="right"
              stroke={CHART_COLORS.axis}
              fontSize={12}
              width={32}
              allowDecimals={false}
            />
            <Tooltip />
            <Line
              yAxisId="spent"
              type="monotone"
              dataKey="totalSpent"
              name="Gasto"
              stroke={CHART_COLORS.revenue}
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="orders"
              type="monotone"
              dataKey="completedOrders"
              name="Compras completadas"
              stroke={CHART_COLORS.orders}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
      <Muted fontSize="xs">
        Solo se consideran pedidos entregados para el gasto y las compras completadas.
      </Muted>
    </VStack>
  </Card>
)
