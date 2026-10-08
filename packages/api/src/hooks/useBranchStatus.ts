import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import type { Branch } from '@repo/domain'
import { SET_BRANCH_ACTIVE } from '../client/admin'
import { BRANCH } from '../client/branch'
import { toBranch } from '../client/store'
import { useAuthStore } from '../stores/authStore'

interface UseBranchStatusReturn {
  isOpen: boolean
  isLoading: boolean
  isUpdating: boolean
  setOpen: (active: boolean) => Promise<void>
  toggle: () => Promise<void>
}

interface BranchResult {
  branch: Record<string, unknown>
}

/**
 * Estado abierto/cerrado de la sucursal del `branch_admin`, respaldado por el backend
 * (`Branch.active`). A diferencia del antiguo store local, persiste en la API.
 */
export const useBranchStatus = (): UseBranchStatusReturn => {
  const branchId = useAuthStore((state) => state.user?.branchId)

  const { data, loading, refetch } = useQuery<BranchResult>(BRANCH, {
    variables: { id: branchId },
    skip: !branchId,
    fetchPolicy: 'network-only',
  })

  const [setActiveMutation, { loading: updating }] = useMutation(SET_BRANCH_ACTIVE)

  const branch: Branch | null = data?.branch ? toBranch(data.branch) : null
  const isOpen = branch?.active ?? true

  const setOpen = useCallback(
    async (active: boolean) => {
      if (!branchId) return
      await setActiveMutation({ variables: { id: branchId, active } })
      await refetch()
    },
    [branchId, setActiveMutation, refetch],
  )

  const toggle = useCallback(() => setOpen(!isOpen), [isOpen, setOpen])

  return { isOpen, isLoading: loading, isUpdating: updating, setOpen, toggle }
}
