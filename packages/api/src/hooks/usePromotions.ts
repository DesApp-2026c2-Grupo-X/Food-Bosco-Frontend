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
  update: (id: string, input: PromotionInput) => Promise<void>
  toggle: (id: string, active: boolean) => Promise<void>
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
      const promotion: Promotion = {
        id: String(Date.now()),
        name: input.name,
        description: input.description ?? null,
        startDate: input.startDate,
        endDate: input.endDate,
        active: input.active,
      }
      MOCK_PROMOTIONS.push(promotion)
      await mutate([...(data ?? MOCK_PROMOTIONS)], { revalidate: false })
      await postJson('/api/catalog/promotions', input)
      setIsMutating(false)
    },
    [data, mutate],
  )

  const update = useCallback(
    async (id: string, input: PromotionInput) => {
      setIsMutating(true)
      const next = (data ?? MOCK_PROMOTIONS).map((promotion) =>
        promotion.id === id
          ? { ...promotion, ...input, description: input.description ?? null }
          : promotion,
      )
      const mock = MOCK_PROMOTIONS.find((promotion) => promotion.id === id)
      if (mock) Object.assign(mock, input, { description: input.description ?? null })
      await mutate(next, { revalidate: false })
      await patchJson(`/api/catalog/promotions/${id}`, input)
      setIsMutating(false)
    },
    [data, mutate],
  )

  const toggle = useCallback(
    async (id: string, active: boolean) => {
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
