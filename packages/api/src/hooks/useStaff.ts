import { useCallback, useState } from 'react'
import useSWR from 'swr'
import type { StaffInput, StaffMember } from '@repo/domain'
import { getJson, patchJson, postJson } from '../client/rest'
import { getBranchById } from '../mocks/branches'
import { MOCK_STAFF } from '../mocks/staff'

const KEY = '/api/users'

type StaffUpdateInput = Omit<StaffInput, 'password'>

interface UseStaffReturn {
  staff: StaffMember[]
  isLoading: boolean
  isMutating: boolean
  create: (input: StaffInput) => Promise<void>
  update: (id: string, input: StaffUpdateInput) => Promise<void>
  toggle: (id: string, active: boolean) => Promise<void>
}

const branchNameFor = (branchId?: string) =>
  branchId == null ? undefined : (getBranchById(branchId)?.name ?? undefined)

export const useStaff = (): UseStaffReturn => {
  const { data, isLoading, mutate } = useSWR<StaffMember[]>(KEY, async (url: string) => {
    const json = await getJson<StaffMember[]>(url)
    if (json && Array.isArray(json) && json.length > 0) return json
    return MOCK_STAFF
  })

  const [isMutating, setIsMutating] = useState(false)

  const create = useCallback(
    async (input: StaffInput) => {
      setIsMutating(true)
      const member: StaffMember = {
        id: `staff-${Date.now()}`,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        role: input.role,
        active: true,
        branchId: input.branchId,
        branchName: branchNameFor(input.branchId),
      }
      MOCK_STAFF.push(member)
      await mutate([...(data ?? MOCK_STAFF)], { revalidate: false })
      await postJson('/api/users/staff', input)
      setIsMutating(false)
    },
    [data, mutate],
  )

  const update = useCallback(
    async (id: string, input: StaffUpdateInput) => {
      setIsMutating(true)
      const next = (data ?? MOCK_STAFF).map((member) =>
        member.id === id
          ? {
              ...member,
              firstName: input.firstName,
              lastName: input.lastName,
              email: input.email,
              phone: input.phone,
              role: input.role,
              branchId: input.branchId,
              branchName: branchNameFor(input.branchId),
            }
          : member,
      )
      const mock = MOCK_STAFF.find((member) => member.id === id)
      if (mock) {
        Object.assign(
          mock,
          next.find((member) => member.id === id),
        )
      }
      await mutate(next, { revalidate: false })
      await patchJson(`/api/users/${id}`, input)
      setIsMutating(false)
    },
    [data, mutate],
  )

  const toggle = useCallback(
    async (id: string, active: boolean) => {
      setIsMutating(true)
      const next = (data ?? MOCK_STAFF).map((member) =>
        member.id === id ? { ...member, active } : member,
      )
      const mock = MOCK_STAFF.find((member) => member.id === id)
      if (mock) mock.active = active
      await mutate(next, { revalidate: false })
      await patchJson(`/api/users/${id}/active`, { active })
      setIsMutating(false)
    },
    [data, mutate],
  )

  return { staff: data ?? [], isLoading, isMutating, create, update, toggle }
}
