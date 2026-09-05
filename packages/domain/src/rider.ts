export interface GeoPoint {
  latitude: number
  longitude: number
}

export interface RiderProfile {
  id: string
  userId: string
  firstName: string | null
  lastName: string | null
  vehicle: string | null
  phone: string | null
  available: boolean
  currentLocation?: GeoPoint | null
}

export interface UpdateRiderProfileInput {
  vehicle?: string
  phone?: string
}
