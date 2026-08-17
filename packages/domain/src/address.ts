export interface Address {
  id: string
  label: string
  street: string
  city: string
  reference?: string
}

export type AddressInput = Omit<Address, "id">
