import { useCallback, useState } from 'react'
import useSWR from 'swr'
import type { Promotion, PromotionInput } from '@repo/domain'
import { getJson, patchJson, postJson } from '../client/rest'
import { MOCK_PROMOTIONS } from '../mocks/promotions'

const KEY = '/api/catalog/promotions'

interface UsePromotionsReturn {
  promotions: Promotion[]
  isLoading: boolean
  isMutating: boolean
  create: (input: PromotionInput) => Promise<void>
  update: (id: number, input: PromotionInput) => Promise<void>
  toggle: (id: number, active: boolean) => Promise<void>
}

export const usePromotions = (): UsePromotionsReturn => {
  const { data, isLoading, mutate } = useSWR<Promotion[]>(KEY, async (url: string) => {
    const json = await getJson<Promotion[]>(url)
    if (json && Array.isArray(json) && json.length > 0) return json
    return MOCK_PROMOTIONS
  })

  const [isMutating, setIsMutating] = useState(false)

  const create = useCallback(
    async (input: PromotionInput) => {
      setIsMutating(true)
      const promotion: Promotion = { id: Date.now(), ...input }
      MOCK_PROMOTIONS.push(promotion)
      await mutate([...(data ?? MOCK_PROMOTIONS)], { revalidate: false })
      await postJson('/api/catalog/promotions', input)
      setIsMutating(false)
    },
    [data, mutate],
  )

  const update = useCallback(
    async (id: number, input: PromotionInput) => {
      setIsMutating(true)
      const next = (data ?? MOCK_PROMOTIONS).map((promotion) =>
        promotion.id === id ? { ...promotion, ...input } : promotion,
      )
      const mock = MOCK_PROMOTIONS.find((promotion) => promotion.id === id)
      if (mock) Object.assign(mock, input)
      await mutate(next, { revalidate: false })
      await patchJson(`/api/catalog/promotions/${id}`, input)
      setIsMutating(false)
    },
    [data, mutate],
  )

  const toggle = useCallback(
    async (id: number, active: boolean) => {
      setIsMutating(true)
      const next = (data ?? MOCK_PROMOTIONS).map((promotion) =>
        promotion.id === id ? { ...promotion, active } : promotion,
      )
      const mock = MOCK_PROMOTIONS.find((promotion) => promotion.id === id)
      if (mock) mock.active = active
      await mutate(next, { revalidate: false })
      await patchJson(`/api/catalog/promotions/${id}/active`, { active })
      setIsMutating(false)
    },
    [data, mutate],
  )

  return { promotions: data ?? [], isLoading, isMutating, create, update, toggle }
}
