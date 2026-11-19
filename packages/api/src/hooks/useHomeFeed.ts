import { useQuery } from '@apollo/client'
import type { HomeFeed } from '@repo/domain'
import { HOME_FEED, toHomeFeed } from '../client/home-feed'
import type { Raw } from '../client/mappers'

export interface UseHomeFeedOptions {
  addressId?: string | null
  lat?: number | null
  lng?: number | null
  enabled?: boolean
  pollIntervalMs?: number
}

export interface UseHomeFeedReturn {
  feed: HomeFeed | null
  isLoading: boolean
  error?: Error
  refetch: () => Promise<unknown>
}

interface HomeFeedResult {
  homeFeed: Raw
}

export const useHomeFeed = ({
  addressId,
  lat,
  lng,
  enabled = true,
  pollIntervalMs,
}: UseHomeFeedOptions = {}): UseHomeFeedReturn => {
  const { data, loading, error, refetch } = useQuery<HomeFeedResult>(HOME_FEED, {
    skip: !enabled,
    variables: {
      input: {
        addressId: addressId ?? null,
        lat: lat ?? null,
        lng: lng ?? null,
      },
    },
    fetchPolicy: 'cache-and-network',
    pollInterval: pollIntervalMs,
  })

  return {
    feed: data?.homeFeed ? toHomeFeed(data.homeFeed) : null,
    isLoading: loading,
    error: error as Error | undefined,
    refetch,
  }
}
