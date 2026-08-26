const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY ?? ''

export interface GeocodedCoordinates {
  lat: number
  lon: number
}

interface GeoapifyGeocodeResponse {
  results?: { lat?: number; lon?: number }[]
}

export const geocodeAddress = async (text: string): Promise<GeocodedCoordinates | null> => {
  if (!GEOAPIFY_API_KEY) return null

  const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(text)}&format=json&limit=1&apiKey=${GEOAPIFY_API_KEY}`

  const res = await fetch(url).catch(() => null)
  if (!res || !res.ok) return null

  const json = (await res.json().catch(() => null)) as GeoapifyGeocodeResponse | null
  const first = json?.results?.[0]
  if (typeof first?.lat === 'number' && typeof first?.lon === 'number') {
    return { lat: first.lat, lon: first.lon }
  }
  return null
}

export interface StaticMapMarker {
  lat: number
  lon: number
  color: string
  label?: string
  icon?: string
}

interface StaticMapInput {
  markers: StaticMapMarker[]
  centerLat: number
  centerLon: number
  zoom?: number
  width?: number
  height?: number
  scaleFactor?: number
}

const encodeColor = (hex: string) => `%23${hex.replace('#', '').toLowerCase()}`

const markerToString = (marker: StaticMapMarker): string => {
  const head = `lonlat:${marker.lon},${marker.lat}`
  if (marker.icon) {
    return [
      head,
      'type:awesome',
      `color:${encodeColor(marker.color)}`,
      'size:52',
      `icon:${marker.icon}`,
      'contentcolor:%23ffffff',
      'contentsize:26',
      'whitecircle:no',
    ].join(';')
  }
  return [
    head,
    'type:circle',
    `color:${encodeColor(marker.color)}`,
    'size:44',
    `text:${marker.label ?? ''}`,
    'contentcolor:%23ffffff',
    'contentsize:24',
  ].join(';')
}

export const buildStaticMapUrl = ({
  markers,
  centerLat,
  centerLon,
  zoom = 14,
  width = 800,
  height = 420,
  scaleFactor = 2,
}: StaticMapInput): string =>
  [
    'https://maps.geoapify.com/v1/staticmap',
    '?style=osm-bright',
    `&width=${width}`,
    `&height=${height}`,
    `&scaleFactor=${scaleFactor}`,
    `&center=lonlat:${centerLon},${centerLat}`,
    `&zoom=${zoom}`,
    `&marker=${markers.map(markerToString).join('|')}`,
    `&apiKey=${GEOAPIFY_API_KEY}`,
  ].join('')
