import { useCallback, useMemo } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import type { StaffInput, StaffMember } from '@repo/domain'
import {
  ADMIN_BRANCHES,
  ADMIN_USERS,
  CREATE_ADMIN,
  CREATE_STAFF,
  SET_USER_ACTIVE,
  UPDATE_USER,
  toBranch,
  toStaffMember,
} from '../client/admin'

type StaffUpdateInput = Omit<StaffInput, 'password'>

interface UseStaffReturn {
  staff: StaffMember[]
  isLoading: boolean
  isMutating: boolean
  create: (input: StaffInput) => Promise<void>
  update: (id: string, input: StaffUpdateInput) => Promise<void>
  toggle: (id: string, active: boolean) => Promise<void>
}

interface UsersResult {
  users: { data: Record<string, unknown>[] }
}

interface BranchesResult {
  branches: Record<string, unknown>[]
}

export const useStaff = (): UseStaffReturn => {
  const { data, loading, refetch } = useQuery<UsersResult>(ADMIN_USERS, {
    fetchPolicy: 'network-only',
  })
  const { data: branchesData } = useQuery<BranchesResult>(ADMIN_BRANCHES, {
    fetchPolicy: 'network-only',
  })

  const [createStaffMutation, { loading: creatingStaff }] = useMutation(CREATE_STAFF)
  const [createAdminMutation, { loading: creatingAdmin }] = useMutation(CREATE_ADMIN)
  const [updateMutation, { loading: updating }] = useMutation(UPDATE_USER)
  const [setActiveMutation, { loading: toggling }] = useMutation(SET_USER_ACTIVE)

  const branchNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const branch of branchesData?.branches ?? []) {
      const mapped = toBranch(branch)
      map.set(mapped.id, mapped.name)
    }
    return map
  }, [branchesData])

  const create = useCallback(
    async (input: StaffInput) => {
      if (input.role === 'super_admin') {
        await createAdminMutation({
          variables: {
            input: {
              firstName: input.firstName,
              lastName: input.lastName,
              email: input.email,
              phone: input.phone,
              password: input.password,
            },
          },
        })
      } else {
        await createStaffMutation({
          variables: {
            input: {
              firstName: input.firstName,
              lastName: input.lastName,
              email: input.email,
              phone: input.phone,
              password: input.password,
              branchId: input.branchId,
            },
          },
        })
      }
      await refetch()
    },
    [createAdminMutation, createStaffMutation, refetch],
  )

  const update = useCallback(
    async (id: string, input: StaffUpdateInput) => {
      await updateMutation({
        variables: {
          id,
          input: {
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
            branchId: input.branchId ?? null,
          },
        },
      })
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

  const staff = (data?.users.data ?? []).map(toStaffMember).map((member) => ({
    ...member,
    branchName: member.branchId == null ? undefined : branchNames.get(member.branchId),
  }))

  return {
    staff,
    isLoading: loading,
    isMutating: creatingStaff || creatingAdmin || updating || toggling,
    create,
    update,
    toggle,
  }
}
