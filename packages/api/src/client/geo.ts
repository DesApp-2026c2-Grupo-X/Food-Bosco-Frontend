export interface GeocodedCoordinates {
  lat: number
  lon: number
}

interface GeoapifyGeocodeResponse {
  results?: { lat?: number; lon?: number }[]
}

export const geocodeAddress = async (
  query: string,
  apiKey: string,
): Promise<GeocodedCoordinates | null> => {
  if (!apiKey) return null

  const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&format=json&limit=1&apiKey=${apiKey}`

  const res = await fetch(url).catch(() => null)
  if (!res || !res.ok) return null

  const json = (await res.json().catch(() => null)) as GeoapifyGeocodeResponse | null
  const first = json?.results?.[0]
  if (typeof first?.lat === 'number' && typeof first?.lon === 'number') {
    return { lat: first.lat, lon: first.lon }
  }
  return null
}
