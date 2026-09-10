export interface Address {
  id: string
  label: string
  text: string
  city: string | null
  postalCode: string | null
  latitude: number
  longitude: number
  active: boolean
}

export interface AddressInput {
  label: string
  text: string
  city?: string
  postalCode?: string
  latitude: number
  longitude: number
}
