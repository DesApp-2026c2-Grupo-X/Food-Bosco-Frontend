import type { Order } from '@repo/domain'
import type { StaticMapMarker } from './geoapify'

interface LatLon {
  lat: number
  lon: number
}

export const tripStops = (orders: Order[]): LatLon[] =>
  orders.flatMap((order) => [
    ...(order.branch ? [{ lat: order.branch.latitude, lon: order.branch.longitude }] : []),
    { lat: order.deliveryAddress.latitude, lon: order.deliveryAddress.longitude },
  ])

export const tripCenter = (orders: Order[]): LatLon => {
  const stops = tripStops(orders)
  const lat = stops.reduce((sum, stop) => sum + stop.lat, 0) / stops.length
  const lon = stops.reduce((sum, stop) => sum + stop.lon, 0) / stops.length
  return { lat, lon }
}

export const tripMarkers = (orders: Order[]): StaticMapMarker[] =>
  orders.flatMap((order) => [
    ...(order.branch
      ? [{ lat: order.branch.latitude, lon: order.branch.longitude, color: '#1d4ed8', label: 'R' }]
      : []),
    {
      lat: order.deliveryAddress.latitude,
      lon: order.deliveryAddress.longitude,
      color: '#15803d',
      label: 'E',
    },
  ])
