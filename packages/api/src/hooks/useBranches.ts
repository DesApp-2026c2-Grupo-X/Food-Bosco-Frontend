import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import type { AdminBranch, BranchHoursInput, BranchInput } from '@repo/domain'
import {
  ADMIN_BRANCHES,
  CREATE_BRANCH,
  SET_BRANCH_ACTIVE,
  UPDATE_BRANCH,
  UPDATE_BRANCH_HOURS,
  toBranch,
} from '../client/admin'

interface UseBranchesReturn {
  branches: AdminBranch[]
  isLoading: boolean
  isMutating: boolean
  create: (input: BranchInput) => Promise<string | null>
  update: (id: string, input: BranchInput) => Promise<void>
  toggle: (id: string, active: boolean) => Promise<void>
  saveHours: (id: string, hours: BranchHoursInput[]) => Promise<void>
}

interface BranchesResult {
  branches: Record<string, unknown>[]
}

interface CreateBranchResult {
  createBranch: Record<string, unknown>
}

export const useBranches = (): UseBranchesReturn => {
  const { data, loading, refetch } = useQuery<BranchesResult>(ADMIN_BRANCHES, {
    fetchPolicy: 'network-only',
  })

  const [createMutation, { loading: creating }] = useMutation<CreateBranchResult>(CREATE_BRANCH)
  const [updateMutation, { loading: updating }] = useMutation(UPDATE_BRANCH)
  const [setActiveMutation, { loading: toggling }] = useMutation(SET_BRANCH_ACTIVE)
  const [updateHoursMutation, { loading: savingHours }] = useMutation(UPDATE_BRANCH_HOURS)

  const create = useCallback(
    async (input: BranchInput): Promise<string | null> => {
      const { data: result } = await createMutation({ variables: { input } })
      await refetch()
      return result?.createBranch ? String(result.createBranch.id) : null
    },
    [createMutation, refetch],
  )

  const update = useCallback(
    async (id: string, input: BranchInput) => {
      await updateMutation({ variables: { id, input } })
      await refetch()
    },
    [updateMutation, refetch],
  )

  const toggle = useCallback(
    async (id: string, active: boolean) => {
      await setActiveMutation({ variables: { id, active } })
      await refetch()
    },
    [setActiveMutation, refetch],
  )

  const saveHours = useCallback(
    async (id: string, hours: BranchHoursInput[]) => {
      const normalized = hours.map((hour) => ({
        dayOfWeek: hour.dayOfWeek,
        opening: hour.opening ?? null,
        closing: hour.closing ?? null,
        closed: hour.closed,
      }))
      await updateHoursMutation({ variables: { branchId: id, hours: normalized } })
      await refetch()
    },
    [updateHoursMutation, refetch],
  )

  return {
    branches: (data?.branches ?? []).map(toBranch),
    isLoading: loading,
    isMutating: creating || updating || toggling || savingHours,
    create,
    update,
    toggle,
    saveHours,
  }
}
