import { VStack } from '@chakra-ui/react'
import { formatPrice } from '@repo/domain'
import {
  CartesianGrid,
  Legend,
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

const formatCompactRevenue = (value: number) =>
  value >= 1000 ? `$${Math.round(value / 1000)}k` : `$${value}`

const formatTooltipValue = (value: unknown, name: unknown) =>
  name === 'Ingresos' ? formatPrice(Number(value)) : String(value)

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
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="bucket" stroke={CHART_COLORS.axis} fontSize={12} tickMargin={8} />
            <YAxis
              yAxisId="revenue"
              stroke={CHART_COLORS.axis}
              fontSize={12}
              width={56}
              tickFormatter={formatCompactRevenue}
            />
            <YAxis
              yAxisId="orders"
              orientation="right"
              stroke={CHART_COLORS.axis}
              fontSize={12}
              width={32}
              allowDecimals={false}
            />
            <Tooltip formatter={formatTooltipValue} />
            <Legend />
            <Line
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              name="Ingresos"
              stroke={CHART_COLORS.revenue}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              yAxisId="orders"
              type="monotone"
              dataKey="orders"
              name="Pedidos"
              stroke={CHART_COLORS.orders}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
      <Muted fontSize="xs">Ingresos y cantidad de pedidos por período.</Muted>
    </VStack>
  </Card>
)
