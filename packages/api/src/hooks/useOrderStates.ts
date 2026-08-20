import { useCallback, useState } from 'react'
import useSWR from 'swr'
import type { OrderState, OrderStateInput } from '@repo/domain'
import { getJson, patchJson, postJson } from '../client/rest'
import { MOCK_ORDER_STATES } from '../mocks/order-states'

const KEY = '/api/config/order-states'

interface UseOrderStatesReturn {
  states: OrderState[]
  isLoading: boolean
  isMutating: boolean
  create: (input: OrderStateInput) => Promise<void>
  update: (code: string, input: OrderStateInput) => Promise<void>
  toggle: (code: string, active: boolean) => Promise<void>
}

export const useOrderStates = (): UseOrderStatesReturn => {
  const { data, isLoading, mutate } = useSWR<OrderState[]>(KEY, async (url: string) => {
    const json = await getJson<OrderState[]>(url)
    if (json && Array.isArray(json) && json.length > 0) return json
    return MOCK_ORDER_STATES
  })

  const [isMutating, setIsMutating] = useState(false)

  const create = useCallback(
    async (input: OrderStateInput) => {
      setIsMutating(true)
      const state: OrderState = {
        code: input.name.toUpperCase().replace(/\s+/g, '_'),
        ...input,
      }
      MOCK_ORDER_STATES.push(state)
      await mutate([...(data ?? MOCK_ORDER_STATES)], { revalidate: false })
      await postJson('/api/config/order-states', { ...input, code: state.code })
      setIsMutating(false)
    },
    [data, mutate],
  )

  const update = useCallback(
    async (code: string, input: OrderStateInput) => {
      setIsMutating(true)
      const next = (data ?? MOCK_ORDER_STATES).map((state) =>
        state.code === code ? { ...state, ...input } : state,
      )
      const mock = MOCK_ORDER_STATES.find((state) => state.code === code)
      if (mock) Object.assign(mock, input)
      await mutate(next, { revalidate: false })
      await patchJson(`/api/config/order-states/${code}`, input)
      setIsMutating(false)
    },
    [data, mutate],
  )

  const toggle = useCallback(
    async (code: string, active: boolean) => {
      setIsMutating(true)
      const next = (data ?? MOCK_ORDER_STATES).map((state) =>
        state.code === code ? { ...state, active } : state,
      )
      const mock = MOCK_ORDER_STATES.find((state) => state.code === code)
      if (mock) mock.active = active
      await mutate(next, { revalidate: false })
      await patchJson(`/api/config/order-states/${code}/active`, { active })
      setIsMutating(false)
    },
    [data, mutate],
  )

  return { states: data ?? [], isLoading, isMutating, create, update, toggle }
}
