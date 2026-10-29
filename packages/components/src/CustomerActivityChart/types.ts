import type { CustomerActivityPoint } from '@repo/domain'

export interface CustomerActivityChartProps {
  data: CustomerActivityPoint[]
  isLoading: boolean
}
