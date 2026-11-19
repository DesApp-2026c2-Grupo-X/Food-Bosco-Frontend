import { useEffect } from 'react'
import { useAuthStore } from '@repo/api'
import { useRecentViewsStore } from '../stores/recentViewsStore'

/**
 * Registra la vista de un producto para el usuario autenticado.
 * Se guarda por `user.id` para que las recomendaciones no se mezclen
 * entre cuentas que comparten el mismo navegador.
 */
export const useTrackRecentView = (productId?: string) => {
  const userId = useAuthStore((state) => state.user?.id)
  const trackProductView = useRecentViewsStore((state) => state.trackProductView)

  useEffect(() => {
    if (!userId || !productId) return
    trackProductView(userId, productId)
  }, [productId, trackProductView, userId])
}
