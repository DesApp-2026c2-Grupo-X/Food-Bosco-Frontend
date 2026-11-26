import { VStack } from '@chakra-ui/react'
import { describeReportGranularity, formatPrice, formatReportBucket } from '@repo/domain'
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

export const SalesTrendChart = ({
  data,
  isLoading,
  groupBy,
  preset,
  spanDays,
}: SalesTrendChartProps) => {
  const formatOptions = { groupBy, preset, spanDays }
  const granularityLabel = describeReportGranularity(groupBy, preset, spanDays)
  const showDots = data.length <= 14
  const hourlyTicks =
    groupBy === 'HOUR' && data.length === 24
      ? [0, 4, 8, 12, 16, 20, 23]
          .map((index) => data[index]?.bucket)
          .filter((v): v is string => Boolean(v))
      : undefined

  return (
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
              <XAxis
                dataKey="bucket"
                stroke={CHART_COLORS.axis}
                fontSize={12}
                tickMargin={8}
                ticks={hourlyTicks}
                minTickGap={12}
                interval={hourlyTicks ? 0 : 'preserveStartEnd'}
                tickFormatter={(value: string) =>
                  formatReportBucket(String(value), formatOptions).axisLabel
                }
              />
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
              <Tooltip
                formatter={formatTooltipValue}
                labelFormatter={(label) =>
                  formatReportBucket(String(label ?? ''), formatOptions).tooltipLabel
                }
              />
              <Legend />
              <Line
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                name="Ingresos"
                stroke={CHART_COLORS.revenue}
                strokeWidth={2}
                dot={showDots ? { r: 3 } : false}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="orders"
                type="monotone"
                dataKey="orders"
                name="Pedidos"
                stroke={CHART_COLORS.orders}
                strokeWidth={2}
                dot={showDots ? { r: 3 } : false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        <Muted fontSize="xs">Ingresos y cantidad de pedidos {granularityLabel}.</Muted>
      </VStack>
    </Card>
  )
}
