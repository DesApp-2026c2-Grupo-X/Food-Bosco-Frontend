import { toTitleCase } from './format'

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

export const toAddressInput = (values: AddressInput): AddressInput => ({
  label: toTitleCase(values.label) || 'Dirección',
  text: toTitleCase(values.text),
  city: values.city?.trim() ? toTitleCase(values.city) : undefined,
  postalCode: values.postalCode?.trim() || undefined,
  latitude: values.latitude,
  longitude: values.longitude,
})
