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
import type { CustomerBuyerTrendChartProps } from './types'

export const CustomerBuyerTrendChart = ({ data, isLoading }: CustomerBuyerTrendChartProps) => (
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
            <XAxis dataKey="bucket" stroke={CHART_COLORS.axis} fontSize={12} />
            <YAxis stroke={CHART_COLORS.axis} fontSize={12} width={40} allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="buyers"
              name="Clientes compradores"
              stroke={CHART_COLORS.revenue}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
      <Muted fontSize="xs">
        Cada cliente se cuenta una sola vez por período, aunque compre más de una vez.
      </Muted>
    </VStack>
  </Card>
)
