import type { Order, OrderStatus } from './order'

export const formatPrice = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)

export const formatOrderDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export const isActiveOrder = (status: OrderStatus) =>
  status !== 'DELIVERED' && status !== 'CANCELLED'

export const getStatusSince = (order: Order): string => {
  const history = order.statusHistory ?? []
  const last = history[history.length - 1]
  return last?.changedAt ?? order.createdAt
}

export const getElapsedMinutes = (iso: string, now: number = Date.now()): number =>
  Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000))

export const formatElapsed = (iso: string, now: number = Date.now()): string => {
  const minutes = getElapsedMinutes(iso, now)
  if (minutes < 1) return 'recién'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    const rest = minutes % 60
    return rest > 0 ? `${hours}h ${rest}m` : `${hours}h`
  }
  const days = Math.floor(hours / 24)
  return `${days}d`
}
