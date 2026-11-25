import { VStack } from '@chakra-ui/react'
import { describeReportGranularity, formatReportBucket } from '@repo/domain'
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
import type { CustomerBuyerTrendChartProps } from './types'

export const CustomerBuyerTrendChart = ({
  data,
  isLoading,
  groupBy,
  preset,
  spanDays,
}: CustomerBuyerTrendChartProps) => {
  const formatOptions = { groupBy, preset, spanDays }
  const granularityLabel = describeReportGranularity(groupBy, preset, spanDays)
  const hourlyTicks =
    groupBy === 'HOUR' && data.length === 24
      ? [0, 4, 8, 12, 16, 20, 23]
          .map((index) => data[index]?.bucket)
          .filter((v): v is string => Boolean(v))
      : undefined

  return (
    <Card>
      <VStack align="stretch" gap="3">
        <Strong fontSize="lg">Evolución de clientes compradores</Strong>
        {isLoading ? (
          <LoadingState variant="skeleton" skeletonCount={1} skeletonHeight="280px" />
        ) : data.length === 0 ? (
          <EmptyState
            title="Sin compradores"
            description="No se registraron compras entregadas en el período seleccionado."
          />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
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
              <YAxis stroke={CHART_COLORS.axis} fontSize={12} width={40} allowDecimals={false} />
              <Tooltip
                labelFormatter={(label) =>
                  formatReportBucket(String(label ?? ''), formatOptions).tooltipLabel
                }
              />
              <Line
                type="monotone"
                dataKey="buyers"
                name="Clientes compradores"
                stroke={CHART_COLORS.revenue}
                strokeWidth={2}
                dot={data.length <= 14 ? { r: 3 } : false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        <Muted fontSize="xs">
          Cada cliente se cuenta una sola vez {granularityLabel}, aunque compre más de una vez.
        </Muted>
      </VStack>
    </Card>
  )
}
