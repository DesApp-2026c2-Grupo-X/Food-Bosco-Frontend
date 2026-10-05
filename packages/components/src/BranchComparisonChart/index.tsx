import { VStack } from '@chakra-ui/react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '../Card'
import { CHART_COLORS } from '../charts/colors'
import { EmptyState, LoadingState } from '../feedback'
import { Muted, Strong } from '../typography'
import type { BranchComparisonChartProps } from './types'

export const BranchComparisonChart = ({ data, isLoading }: BranchComparisonChartProps) => (
  <Card>
    <VStack align="stretch" gap="3">
      <Strong fontSize="lg">Comparación entre sucursales</Strong>
      {isLoading ? (
        <LoadingState variant="skeleton" skeletonCount={1} skeletonHeight="280px" />
      ) : data.length === 0 ? (
        <EmptyState
          title="Sin datos"
          description="No hay facturación por sucursal en el período."
        />
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(220, data.length * 44)}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
          >
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" stroke={CHART_COLORS.axis} fontSize={12} />
            <YAxis
              type="category"
              dataKey="branchName"
              stroke={CHART_COLORS.axis}
              fontSize={12}
              width={120}
            />
            <Tooltip />
            <Bar
              dataKey="revenue"
              name="Ingresos"
              fill={CHART_COLORS.branch}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
      <Muted fontSize="xs">Ingresos por sucursal en el período seleccionado.</Muted>
    </VStack>
  </Card>
)
