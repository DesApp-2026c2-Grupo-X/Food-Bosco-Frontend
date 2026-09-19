import type { AdminBranch, BranchHoursInput, BranchInput } from '@repo/domain'
import {
  ADMIN_BRANCHES,
  CREATE_BRANCH,
  SET_BRANCH_ACTIVE,
  UPDATE_BRANCH,
  UPDATE_BRANCH_HOURS,
  toBranch,
} from '../client/admin'
import { createCrudResource } from './createCrudResource'

interface UseBranchesReturn {
  branches: AdminBranch[]
  isLoading: boolean
  isMutating: boolean
  create: (input: BranchInput) => Promise<string | null>
  update: (id: string, input: BranchInput) => Promise<void>
  toggle: (id: string, active: boolean) => Promise<void>
  saveHours: (id: string, hours: BranchHoursInput[]) => Promise<void>
}

const useBranchesResource = createCrudResource({
  query: {
    document: ADMIN_BRANCHES,
    resultKey: 'branches',
    map: toBranch,
    fetchPolicy: 'network-only',
  },
  create: {
    document: CREATE_BRANCH,
    variables: (input: BranchInput) => ({ input }),
    select: (data) =>
      data?.createBranch ? String((data.createBranch as { id: unknown }).id) : null,
  },
  update: {
    document: UPDATE_BRANCH,
    variables: (id: string, input: BranchInput) => ({ id, input }),
  },
  toggle: {
    document: SET_BRANCH_ACTIVE,
    variables: (id: string, active: boolean) => ({ id, active }),
  },
  extra: {
    saveHours: {
      document: UPDATE_BRANCH_HOURS,
      variables: (id: string, hours: BranchHoursInput[]) => ({
        branchId: id,
        hours: hours.map((hour) => ({
          dayOfWeek: hour.dayOfWeek,
          opening: hour.closed ? null : hour.opening || null,
          closing: hour.closed ? null : hour.closing || null,
          closed: hour.closed,
        })),
      }),
    },
  },
})

export const useBranches: () => UseBranchesReturn = useBranchesResource
