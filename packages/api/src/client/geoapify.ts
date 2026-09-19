import {
  buildStaticMapUrl as buildStaticMapUrlShared,
  geocodeAddress as geocodeAddressShared,
  type StaticMapInput,
} from './geo'

const GEOAPIFY_API_KEY =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GEOAPIFY_API_KEY ?? ''

export type { GeocodedCoordinates, StaticMapInput, StaticMapMarker } from './geo'

export const geocodeAddress = (text: string) => geocodeAddressShared(text, GEOAPIFY_API_KEY)

export const buildStaticMapUrl = (input: StaticMapInput): string =>
  buildStaticMapUrlShared({ ...input, apiKey: GEOAPIFY_API_KEY })
