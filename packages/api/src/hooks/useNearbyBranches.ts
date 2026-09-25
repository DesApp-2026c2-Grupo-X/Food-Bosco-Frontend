import { useQuery } from '@apollo/client'
import type { Branch } from '@repo/domain'
import { NEARBY_BRANCHES, toBranch } from '../client/store'

interface UseNearbyBranchesReturn {
  branches: Branch[]
  isLoading: boolean
}

interface NearbyBranchesResult {
  nearbyBranches: Record<string, unknown>[]
}

export const useNearbyBranches = (
  lat: number | null | undefined,
  lng: number | null | undefined,
): UseNearbyBranchesReturn => {
  const { data, loading } = useQuery<NearbyBranchesResult>(NEARBY_BRANCHES, {
    variables: { lat, lng },
    skip: lat == null || lng == null,
  })

  return {
    branches: (data?.nearbyBranches ?? []).map(toBranch),
    isLoading: loading,
  }
}
