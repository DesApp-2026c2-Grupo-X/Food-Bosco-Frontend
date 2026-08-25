import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface RiderState {
  isOnline: boolean
  setOnline: (value: boolean) => void
}

export const useRiderStore = create<RiderState>()(
  persist(
    (set) => ({
      isOnline: true,
      setOnline: (value) => set({ isOnline: value }),
    }),
    {
      name: 'rider',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
