import { useQuery } from '@apollo/client'
import type { Branch } from '@repo/domain'
import { BRANCH } from '../client/branch'
import { toBranch } from '../client/store'
import { useAuthStore } from '../stores/authStore'

interface UseBranchReturn {
  branch: Branch | null
  isLoading: boolean
}

interface BranchResult {
  branch: Record<string, unknown>
}

export const useBranch = (): UseBranchReturn => {
  const branchId = useAuthStore((state) => state.user?.branchId)

  const { data, loading } = useQuery<BranchResult>(BRANCH, {
    variables: { id: branchId },
    skip: !branchId,
    fetchPolicy: 'network-only',
  })

  return {
    branch: data?.branch ? toBranch(data.branch) : null,
    isLoading: loading,
  }
}
