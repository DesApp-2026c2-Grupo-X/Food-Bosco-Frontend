import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Address, AddressInput } from '@repo/domain'
import { MOCK_ADDRESSES } from '../utils/addresses'

interface AddressState {
  addresses: Address[]
  selectedAddressId: string | null
  selectAddress: (id: string) => void
  addAddress: (input: AddressInput) => void
  updateAddress: (id: string, input: AddressInput) => void
  removeAddress: (id: string) => void
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set) => ({
      addresses: MOCK_ADDRESSES,
      selectedAddressId: null,

      selectAddress: (id) => set({ selectedAddressId: id }),

      addAddress: (input) =>
        set((state) => {
          const address: Address = { ...input, id: `addr-${Date.now()}` }
          return {
            addresses: [...state.addresses, address],
            selectedAddressId: address.id,
          }
        }),

      updateAddress: (id, input) =>
        set((state) => ({
          addresses: state.addresses.map((a) => (a.id === id ? { ...a, ...input } : a)),
        })),

      removeAddress: (id) =>
        set((state) => ({
          addresses: state.addresses.filter((a) => a.id !== id),
          selectedAddressId: state.selectedAddressId === id ? null : state.selectedAddressId,
        })),
    }),
    {
      name: 'store-address',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

export const selectedAddress = (state: AddressState) =>
  state.addresses.find((a) => a.id === state.selectedAddressId) ?? null
