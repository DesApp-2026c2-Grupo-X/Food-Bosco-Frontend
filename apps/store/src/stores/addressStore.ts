import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface AddressState {
  selectedAddressId: string | null
  selectAddress: (id: string) => void
  clearAddress: () => void
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set) => ({
      selectedAddressId: null,
      selectAddress: (id) => set({ selectedAddressId: id }),
      clearAddress: () => set({ selectedAddressId: null }),
    }),
    {
      name: 'store-address',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
