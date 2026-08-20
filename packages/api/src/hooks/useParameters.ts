import { useCallback, useState } from 'react'
import useSWR from 'swr'
import type { Parameter } from '@repo/domain'
import { getJson, patchJson } from '../client/rest'
import { MOCK_PARAMETERS } from '../mocks/parameters'

const KEY = '/api/config/parameters'

interface UseParametersReturn {
  parameters: Parameter[]
  isLoading: boolean
  isMutating: boolean
  update: (key: string, value: number) => Promise<void>
}

export const useParameters = (): UseParametersReturn => {
  const { data, isLoading, mutate } = useSWR<Parameter[]>(KEY, async (url: string) => {
    const json = await getJson<Parameter[]>(url)
    if (json && Array.isArray(json) && json.length > 0) return json
    return MOCK_PARAMETERS
  })

  const [isMutating, setIsMutating] = useState(false)

  const update = useCallback(
    async (key: string, value: number) => {
      setIsMutating(true)
      const next = (data ?? MOCK_PARAMETERS).map((parameter) =>
        parameter.key === key ? { ...parameter, value } : parameter,
      )
      const mock = MOCK_PARAMETERS.find((parameter) => parameter.key === key)
      if (mock) mock.value = value
      await mutate(next, { revalidate: false })
      await patchJson(`/api/config/parameters/${key}`, { value })
      setIsMutating(false)
    },
    [data, mutate],
  )

  return { parameters: data ?? [], isLoading, isMutating, update }
}
