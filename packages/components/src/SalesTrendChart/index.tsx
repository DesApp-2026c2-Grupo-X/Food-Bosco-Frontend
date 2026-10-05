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
import type { SalesTrendChartProps } from './types'

export const SalesTrendChart = ({ data, isLoading }: SalesTrendChartProps) => (
  <Card>
    <VStack align="stretch" gap="3">
      <Strong fontSize="lg">Evolución de ventas</Strong>
      {isLoading ? (
        <LoadingState variant="skeleton" skeletonCount={1} skeletonHeight="280px" />
      ) : data.length === 0 ? (
        <EmptyState title="Sin datos" description="No hay ventas para el período seleccionado." />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="bucket" stroke={CHART_COLORS.axis} fontSize={12} />
            <YAxis stroke={CHART_COLORS.axis} fontSize={12} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Ingresos"
              stroke={CHART_COLORS.revenue}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="orders"
              name="Pedidos"
              stroke={CHART_COLORS.orders}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
      <Muted fontSize="xs">Ingresos y cantidad de pedidos por período.</Muted>
    </VStack>
  </Card>
)
