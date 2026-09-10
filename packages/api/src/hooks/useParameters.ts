import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import type { Parameter } from '@repo/domain'
import { ADMIN_PARAMETERS, UPDATE_PARAMETER, toParameter } from '../client/admin'

interface UseParametersReturn {
  parameters: Parameter[]
  isLoading: boolean
  isMutating: boolean
  update: (key: string, value: number) => Promise<void>
}

interface ParametersResult {
  parameters: Record<string, unknown>[]
}

export const useParameters = (): UseParametersReturn => {
  const { data, loading, refetch } = useQuery<ParametersResult>(ADMIN_PARAMETERS, {
    fetchPolicy: 'network-only',
  })

  const [updateMutation, { loading: updating }] = useMutation(UPDATE_PARAMETER)

  const update = useCallback(
    async (key: string, value: number) => {
      await updateMutation({ variables: { key, value } })
      await refetch()
    },
    [updateMutation, refetch],
  )

  return {
    parameters: (data?.parameters ?? []).map(toParameter),
    isLoading: loading,
    isMutating: updating,
    update,
  }
}
