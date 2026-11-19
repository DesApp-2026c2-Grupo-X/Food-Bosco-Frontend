import { useQuery } from '@apollo/client'
import type { Promotion } from '@repo/domain'
import { PUBLIC_PROMOTIONS } from '../client/store'
import { toPromotion } from '../client/admin'

export interface UsePublicPromotionsReturn {
  promotions: Promotion[]
  isLoading: boolean
  error?: Error
  refetch: () => Promise<unknown>
}

export const usePublicPromotions = (): UsePublicPromotionsReturn => {
  const { data, loading, error, refetch } = useQuery<{
    publicPromotions: Record<string, unknown>[]
  }>(PUBLIC_PROMOTIONS, { fetchPolicy: 'cache-and-network' })

  const promotions: Promotion[] = (data?.publicPromotions ?? []).map((raw) => toPromotion(raw))

  return {
    promotions,
    isLoading: loading,
    error: error as Error | undefined,
    refetch,
  }
}
