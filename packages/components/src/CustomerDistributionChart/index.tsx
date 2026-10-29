import { VStack } from '@chakra-ui/react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '../Card'
import { CHART_COLORS } from '../charts/colors'
import { EmptyState, LoadingState } from '../feedback'
import { Muted, Strong } from '../typography'
import type { CustomerDistributionChartProps } from './types'

export const CustomerDistributionChart = ({
  title,
  description,
  emptyDescription,
  data,
  isLoading,
}: CustomerDistributionChartProps) => (
  <Card>
    <VStack align="stretch" gap="3">
      <Strong fontSize="lg">{title}</Strong>
      {isLoading ? (
        <LoadingState variant="skeleton" skeletonCount={1} skeletonHeight="240px" />
      ) : data.every((entry) => entry.buyers === 0) ? (
        <EmptyState title="Sin datos" description={emptyDescription} />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" stroke={CHART_COLORS.axis} fontSize={12} interval={0} />
            <YAxis stroke={CHART_COLORS.axis} fontSize={12} width={40} allowDecimals={false} />
            <Tooltip />
            <Bar
              dataKey="buyers"
              name="Clientes"
              fill={CHART_COLORS.orders}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
      <Muted fontSize="xs">{description}</Muted>
    </VStack>
  </Card>
)
