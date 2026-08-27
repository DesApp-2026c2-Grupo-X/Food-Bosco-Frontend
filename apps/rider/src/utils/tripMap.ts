import type { Order } from '@repo/domain'
import type { StaticMapMarker } from './geoapify'

interface LatLon {
  lat: number
  lon: number
}

export const tripStops = (orders: Order[]): LatLon[] =>
  orders.flatMap((order) => [
    { lat: order.store.lat, lon: order.store.lon },
    { lat: order.client.lat, lon: order.client.lon },
  ])

export const tripCenter = (orders: Order[]): LatLon => {
  const stops = tripStops(orders)
  const lat = stops.reduce((sum, stop) => sum + stop.lat, 0) / stops.length
  const lon = stops.reduce((sum, stop) => sum + stop.lon, 0) / stops.length
  return { lat, lon }
}

export const tripMarkers = (orders: Order[]): StaticMapMarker[] =>
  orders.flatMap((order) => [
    { lat: order.store.lat, lon: order.store.lon, color: '#1d4ed8', label: 'R' },
    { lat: order.client.lat, lon: order.client.lon, color: '#15803d', label: 'E' },
  ])
