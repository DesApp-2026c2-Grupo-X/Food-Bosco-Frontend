import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface BranchStatusState {
  isOpen: boolean
  toggle: () => void
  setOpen: (value: boolean) => void
}

export const useBranchStatusStore = create<BranchStatusState>()(
  persist(
    (set) => ({
      isOpen: true,
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setOpen: (value) => set({ isOpen: value }),
    }),
    {
      name: 'branch-status',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
