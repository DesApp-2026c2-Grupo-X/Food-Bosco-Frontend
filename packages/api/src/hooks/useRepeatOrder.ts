import { useCallback, useState } from 'react'
import { useMutation } from '@apollo/client'
import type { RepeatOrderResult } from '@repo/domain'
import { REPEAT_ORDER, toRepeatOrderResult } from '../client/store'
import { combineLoading } from '../utils/combineLoading'

interface UseRepeatOrderReturn {
  repeatOrder: (orderId: string) => Promise<RepeatOrderResult | null>
  isLoading: boolean
}

interface RepeatOrderMutationResult {
  repeatOrder: Record<string, unknown> | null
}

export const useRepeatOrder = (): UseRepeatOrderReturn => {
  const [mutate, { loading }] = useMutation<RepeatOrderMutationResult>(REPEAT_ORDER)
  const [isLoading, setIsLoading] = useState(false)

  const repeatOrder = useCallback(
    async (orderId: string): Promise<RepeatOrderResult | null> => {
      setIsLoading(true)
      try {
        const { data } = await mutate({ variables: { orderId } })
        return data?.repeatOrder ? toRepeatOrderResult(data.repeatOrder) : null
      } finally {
        setIsLoading(false)
      }
    },
    [mutate],
  )

  return { repeatOrder, isLoading: combineLoading(loading, isLoading) }
}
