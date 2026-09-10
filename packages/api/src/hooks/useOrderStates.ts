import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import type { OrderState, OrderStateInput } from '@repo/domain'
import {
  ADMIN_ORDER_STATES,
  CREATE_ORDER_STATE,
  SET_ORDER_STATE_ACTIVE,
  UPDATE_ORDER_STATE,
  toOrderState,
} from '../client/admin'

interface UseOrderStatesReturn {
  states: OrderState[]
  isLoading: boolean
  isMutating: boolean
  create: (input: OrderStateInput) => Promise<void>
  update: (code: string, input: OrderStateInput) => Promise<void>
  toggle: (code: string, active: boolean) => Promise<void>
}

interface OrderStatesResult {
  orderStates: Record<string, unknown>[]
}

export const useOrderStates = (): UseOrderStatesReturn => {
  const { data, loading, refetch } = useQuery<OrderStatesResult>(ADMIN_ORDER_STATES, {
    fetchPolicy: 'network-only',
  })

  const [createMutation, { loading: creating }] = useMutation(CREATE_ORDER_STATE)
  const [updateMutation, { loading: updating }] = useMutation(UPDATE_ORDER_STATE)
  const [setActiveMutation, { loading: toggling }] = useMutation(SET_ORDER_STATE_ACTIVE)

  const create = useCallback(
    async (input: OrderStateInput) => {
      await createMutation({ variables: { input } })
      await refetch()
    },
    [createMutation, refetch],
  )

  const update = useCallback(
    async (code: string, input: OrderStateInput) => {
      await updateMutation({ variables: { code, input } })
      await refetch()
    },
    [updateMutation, refetch],
  )

  const toggle = useCallback(
    async (code: string, active: boolean) => {
      await setActiveMutation({ variables: { code, active } })
      await refetch()
    },
    [setActiveMutation, refetch],
  )

  return {
    states: (data?.orderStates ?? []).map(toOrderState),
    isLoading: loading,
    isMutating: creating || updating || toggling,
    create,
    update,
    toggle,
  }
}
