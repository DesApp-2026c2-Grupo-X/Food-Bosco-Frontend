export const CHART_COLORS = {
  revenue: '#EA580C',
  orders: '#F59E0B',
  branch: '#C2410C',
  grid: '#E5E7EB',
  axis: '#6B7280',
} as const

export const STATUS_COLORS: Record<string, string> = {
  PENDING: '#EAB308',
  CONFIRMED: '#3B82F6',
  PREPARING: '#F97316',
  READY_FOR_DELIVERY: '#8B5CF6',
  ON_THE_WAY: '#2563EB',
  DELIVERED: '#15803D',
  CANCELLED: '#B91C1C',
}
