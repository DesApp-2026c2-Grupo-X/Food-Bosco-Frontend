import { geocodeAddress as geocodeAddressShared } from './geo'

const GEOAPIFY_API_KEY =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GEOAPIFY_API_KEY ?? ''

export type { GeocodedCoordinates } from './geo'

export const isGeocodingEnabled = GEOAPIFY_API_KEY.length > 0

export const geocodeAddress = (text: string) => geocodeAddressShared(text, GEOAPIFY_API_KEY)

export const buildLeafletTileUrl = (style = 'positron', retina = false): string => {
  if (!GEOAPIFY_API_KEY) return ''
  const scale = retina ? '@2x' : ''
  return `https://maps.geoapify.com/v1/tile/${style}/{z}/{x}/{y}${scale}.png?apiKey=${GEOAPIFY_API_KEY}`
}
