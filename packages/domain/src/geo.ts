export interface GeoPoint {
  latitude: number
  longitude: number
}

const EARTH_RADIUS_M = 6371000

const toRadians = (value: number) => (value * Math.PI) / 180

export const haversineDistanceMeters = (from: GeoPoint, to: GeoPoint): number => {
  const dLat = toRadians(to.latitude - from.latitude)
  const dLon = toRadians(to.longitude - from.longitude)
  const lat1 = toRadians(from.latitude)
  const lat2 = toRadians(to.latitude)

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))
}
