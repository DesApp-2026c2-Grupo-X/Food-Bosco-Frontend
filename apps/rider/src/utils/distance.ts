interface LatLon {
  lat: number
  lon: number
}

const EARTH_RADIUS_M = 6371000

const toRadians = (value: number) => (value * Math.PI) / 180

export const haversineDistanceMeters = (a: LatLon, b: LatLon): number => {
  const dLat = toRadians(b.lat - a.lat)
  const dLon = toRadians(b.lon - a.lon)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))
}
