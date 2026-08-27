import { useCallback, useState } from 'react'
import useSWR from 'swr'
import type { AdminBranch, BranchHoursInput, BranchInput } from '@repo/domain'
import { getJson, patchJson, postJson } from '../client/rest'
import { MOCK_BRANCHES } from '../mocks/branches'

const KEY = '/api/branches'

const defaultHours = (): BranchHoursInput[] =>
  [1, 2, 3, 4, 5, 6, 7].map((dayOfWeek) => ({
    dayOfWeek,
    opening: '09:00',
    closing: '23:00',
    closed: false,
  }))

interface UseBranchesReturn {
  branches: AdminBranch[]
  isLoading: boolean
  isMutating: boolean
  create: (input: BranchInput) => Promise<number | null>
  update: (id: number, input: BranchInput) => Promise<void>
  toggle: (id: number, active: boolean) => Promise<void>
  saveHours: (id: number, hours: BranchHoursInput[]) => Promise<void>
}

export const useBranches = (): UseBranchesReturn => {
  const { data, isLoading, mutate } = useSWR<AdminBranch[]>(KEY, async (url: string) => {
    const json = await getJson<AdminBranch[]>(url)
    if (json && Array.isArray(json) && json.length > 0) return json
    return MOCK_BRANCHES
  })

  const [isMutating, setIsMutating] = useState(false)

  const create = useCallback(
    async (input: BranchInput): Promise<number | null> => {
      setIsMutating(true)
      const branch: AdminBranch = {
        id: Date.now(),
        ...input,
        hours: defaultHours(),
      }
      MOCK_BRANCHES.push(branch)
      await mutate([...(data ?? MOCK_BRANCHES)], { revalidate: false })
      await postJson('/api/branches', input)
      setIsMutating(false)
      return branch.id
    },
    [data, mutate],
  )

  const update = useCallback(
    async (id: number, input: BranchInput) => {
      setIsMutating(true)
      const next = (data ?? MOCK_BRANCHES).map((branch) =>
        branch.id === id ? { ...branch, ...input } : branch,
      )
      const mock = MOCK_BRANCHES.find((branch) => branch.id === id)
      if (mock) Object.assign(mock, input)
      await mutate(next, { revalidate: false })
      await patchJson(`/api/branches/${id}`, input)
      setIsMutating(false)
    },
    [data, mutate],
  )

  const toggle = useCallback(
    async (id: number, active: boolean) => {
      setIsMutating(true)
      const next = (data ?? MOCK_BRANCHES).map((branch) =>
        branch.id === id ? { ...branch, active } : branch,
      )
      const mock = MOCK_BRANCHES.find((branch) => branch.id === id)
      if (mock) mock.active = active
      await mutate(next, { revalidate: false })
      await patchJson(`/api/branches/${id}/active`, { active })
      setIsMutating(false)
    },
    [data, mutate],
  )

  const saveHours = useCallback(
    async (id: number, hours: BranchHoursInput[]) => {
      setIsMutating(true)
      const next = (data ?? MOCK_BRANCHES).map((branch) =>
        branch.id === id ? { ...branch, hours } : branch,
      )
      const mock = MOCK_BRANCHES.find((branch) => branch.id === id)
      if (mock) mock.hours = hours
      await mutate(next, { revalidate: false })
      await postJson(`/api/branches/${id}/hours`, { hours })
      setIsMutating(false)
    },
    [data, mutate],
  )

  return { branches: data ?? [], isLoading, isMutating, create, update, toggle, saveHours }
}
