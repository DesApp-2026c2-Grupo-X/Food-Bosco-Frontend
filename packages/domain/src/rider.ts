export interface GeoPoint {
  latitude: number
  longitude: number
}

export type VehicleType = 'moto' | 'bici'

export interface Vehicle {
  type: VehicleType
  marca?: string
  modelo?: string
  patente?: string
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
  marca?: string
  modelo?: string
  patente?: string
}

export const formatVehicle = (vehicle: Vehicle): string => {
  if (vehicle.type === 'bici') return 'Bici'
  const parts = ['Moto', vehicle.marca, vehicle.modelo, vehicle.patente].filter(Boolean) as string[]
  return parts.join(' · ')
}
