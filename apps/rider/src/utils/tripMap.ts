import type { StaticMapMarker } from '@repo/api'
import type { GeoPoint, TripOrder } from '@repo/domain'
import { MAP_MARKER_COLORS } from '@repo/theme'

export const tripStops = (orders: TripOrder[]): GeoPoint[] =>
  orders.flatMap((order) => [
    order.pickupLocation,
    { latitude: order.deliveryAddress.latitude, longitude: order.deliveryAddress.longitude },
  ])

export const tripCenter = (orders: TripOrder[]): GeoPoint => {
  const stops = tripStops(orders)
  const latitude = stops.reduce((sum, stop) => sum + stop.latitude, 0) / stops.length
  const longitude = stops.reduce((sum, stop) => sum + stop.longitude, 0) / stops.length
  return { latitude, longitude }
}

export const tripMarkers = (orders: TripOrder[]): StaticMapMarker[] =>
  orders.flatMap((order) => [
    {
      lat: order.pickupLocation.latitude,
      lon: order.pickupLocation.longitude,
      color: MAP_MARKER_COLORS.branch,
      label: 'R',
    },
    {
      lat: order.deliveryAddress.latitude,
      lon: order.deliveryAddress.longitude,
      color: MAP_MARKER_COLORS.client,
      label: 'E',
    },
  ])
