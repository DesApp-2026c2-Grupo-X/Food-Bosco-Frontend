export interface GeoPoint {
  latitude: number
  longitude: number
}

export type VehicleType = 'moto' | 'bici'

export interface Vehicle {
  type: VehicleType
  brand?: string
  model?: string
  plate?: string
}

export interface RiderProfile {
  id: string
  userId: string
  firstName: string | null
  lastName: string | null
  vehicle: Vehicle
  phone: string | null
  available: boolean
  currentLocation?: GeoPoint | null
}

export interface UpdateRiderProfileInput {
  phone?: string
}

export interface UpdateVehicleInput {
  type: VehicleType
  brand?: string
  model?: string
  plate?: string
}

export const formatVehicle = (vehicle: Vehicle): string => {
  if (vehicle.type === 'bici') return 'Bici'
  const parts = ['Moto', vehicle.brand, vehicle.model, vehicle.plate].filter(Boolean) as string[]
  return parts.join(' · ')
}
