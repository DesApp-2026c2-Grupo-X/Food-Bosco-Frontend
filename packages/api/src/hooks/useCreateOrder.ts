import { useCallback, useState } from 'react'
import { useMutation } from '@apollo/client'
import type { Order } from '@repo/domain'
import { CREATE_ORDER, toOrder } from '../client/store'

interface UseCreateOrderReturn {
  createOrder: (addressId: string) => Promise<Order | null>
  isLoading: boolean
}

interface CreateOrderResult {
  createOrder: Record<string, unknown>
}

export const useCreateOrder = (): UseCreateOrderReturn => {
  const [mutate, { loading }] = useMutation<CreateOrderResult>(CREATE_ORDER)
  const [isLoading, setIsLoading] = useState(false)

  const createOrder = useCallback(
    async (addressId: string): Promise<Order | null> => {
      setIsLoading(true)
      try {
        const { data } = await mutate({ variables: { addressId } })
        return data?.createOrder ? toOrder(data.createOrder) : null
      } finally {
        setIsLoading(false)
      }
    },
    [mutate],
  )

  return { createOrder, isLoading: loading || isLoading }
}
