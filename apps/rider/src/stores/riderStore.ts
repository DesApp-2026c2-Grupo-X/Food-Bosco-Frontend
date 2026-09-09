import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface RiderLocation {
  latitude: number
  longitude: number
}

interface RiderState {
  isOnline: boolean
  location: RiderLocation | null
  setOnline: (value: boolean) => void
  setLocation: (location: RiderLocation) => void
}

export const useRiderStore = create<RiderState>()(
  persist(
    (set) => ({
      isOnline: true,
      location: null,
      setOnline: (value) => set({ isOnline: value }),
      setLocation: (location) => set({ location }),
    }),
    {
      name: 'rider',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ isOnline: state.isOnline }),
    },
  ),
)
