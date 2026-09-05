import { useQuery } from '@apollo/client'
import type { Branch } from '@repo/domain'
import { AVAILABLE_BRANCHES, toBranch } from '../client/store'

interface UseAvailableBranchesReturn {
  branches: Branch[]
  isLoading: boolean
}

interface AvailableBranchesResult {
  availableBranches: Record<string, unknown>[]
}

export const useAvailableBranches = (
  lat: number | null | undefined,
  lng: number | null | undefined,
): UseAvailableBranchesReturn => {
  const { data, loading } = useQuery<AvailableBranchesResult>(AVAILABLE_BRANCHES, {
    variables: { lat, lng },
    skip: lat == null || lng == null,
  })

  return {
    branches: (data?.availableBranches ?? []).map(toBranch),
    isLoading: loading,
  }
}
