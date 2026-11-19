import { useQuery } from '@apollo/client'
import type { PromotionCatalogItem } from '@repo/domain'
import { PROMOTION_CATALOG, toPromotionCatalogItem } from '../client/store'

export interface UsePromotionCatalogReturn {
  promotions: PromotionCatalogItem[]
  isLoading: boolean
  error?: Error
  refetch: () => Promise<unknown>
}

interface PromotionCatalogResult {
  promotionCatalog: Record<string, unknown>[]
}

export const usePromotionCatalog = (
  lat?: number | null,
  lng?: number | null,
): UsePromotionCatalogReturn => {
  const skip = lat == null || lng == null
  const { data, loading, error, refetch } = useQuery<PromotionCatalogResult>(PROMOTION_CATALOG, {
    variables: { lat: lat ?? null, lng: lng ?? null },
    skip,
    fetchPolicy: 'cache-and-network',
  })

  return {
    promotions: (data?.promotionCatalog ?? []).map((raw) => toPromotionCatalogItem(raw)),
    isLoading: loading,
    error: error as Error | undefined,
    refetch,
  }
}
