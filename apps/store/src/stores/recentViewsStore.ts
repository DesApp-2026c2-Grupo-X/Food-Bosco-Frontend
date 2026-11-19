import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface RecentProductView {
  productId: string
  viewedAt: string
}

interface RecentViewsState {
  viewsByUser: Record<string, RecentProductView[]>
  trackProductView: (userId: string, productId: string) => void
  clearUser: (userId: string) => void
  clearAll: () => void
}

const MAX_VIEWS_PER_USER = 12

export const useRecentViewsStore = create<RecentViewsState>()(
  persist(
    (set) => ({
      viewsByUser: {},
      trackProductView: (userId, productId) =>
        set((state) => {
          if (!userId || !productId) return state

          const productIds = state.viewsByUser[userId] ?? []
          const next: RecentProductView[] = [
            { productId, viewedAt: new Date().toISOString() },
            ...productIds.filter((view) => view.productId !== productId),
          ].slice(0, MAX_VIEWS_PER_USER)

          return { viewsByUser: { ...state.viewsByUser, [userId]: next } }
        }),
      clearUser: (userId) =>
        set((state) => {
          const next = { ...state.viewsByUser }
          delete next[userId]
          return { viewsByUser: next }
        }),
      clearAll: () => set({ viewsByUser: {} }),
    }),
    {
      name: 'store-recent-views',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
