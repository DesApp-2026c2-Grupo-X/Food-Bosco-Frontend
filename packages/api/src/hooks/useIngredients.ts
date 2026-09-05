import { useCallback, useState } from 'react'
import useSWR from 'swr'
import type { Ingredient, IngredientInput } from '@repo/domain'
import { getJson, patchJson, postJson } from '../client/rest'
import { MOCK_INGREDIENTS } from '../mocks/ingredients'

const KEY = '/api/catalog/ingredients'

interface UseIngredientsReturn {
  ingredients: Ingredient[]
  isLoading: boolean
  isMutating: boolean
  create: (input: IngredientInput) => Promise<void>
  update: (id: string, input: IngredientInput) => Promise<void>
  toggle: (id: string, active: boolean) => Promise<void>
}

export const useIngredients = (): UseIngredientsReturn => {
  const { data, isLoading, mutate } = useSWR<Ingredient[]>(KEY, async (url: string) => {
    const json = await getJson<Ingredient[]>(url)
    if (json && Array.isArray(json) && json.length > 0) return json
    return MOCK_INGREDIENTS
  })

  const [isMutating, setIsMutating] = useState(false)

  const create = useCallback(
    async (input: IngredientInput) => {
      setIsMutating(true)
      const ingredient: Ingredient = { id: String(Date.now()), ...input }
      MOCK_INGREDIENTS.push(ingredient)
      await mutate([...(data ?? MOCK_INGREDIENTS)], { revalidate: false })
      await postJson('/api/catalog/ingredients', input)
      setIsMutating(false)
    },
    [data, mutate],
  )

  const update = useCallback(
    async (id: string, input: IngredientInput) => {
      setIsMutating(true)
      const next = (data ?? MOCK_INGREDIENTS).map((ingredient) =>
        ingredient.id === id ? { ...ingredient, name: input.name, unit: input.unit } : ingredient,
      )
      const mock = MOCK_INGREDIENTS.find((ingredient) => ingredient.id === id)
      if (mock) {
        mock.name = input.name
        mock.unit = input.unit
      }
      await mutate(next, { revalidate: false })
      await patchJson(`/api/catalog/ingredients/${id}`, input)
      setIsMutating(false)
    },
    [data, mutate],
  )

  const toggle = useCallback(
    async (id: string, active: boolean) => {
      setIsMutating(true)
      const next = (data ?? MOCK_INGREDIENTS).map((ingredient) =>
        ingredient.id === id ? { ...ingredient, active } : ingredient,
      )
      const mock = MOCK_INGREDIENTS.find((ingredient) => ingredient.id === id)
      if (mock) mock.active = active
      await mutate(next, { revalidate: false })
      await patchJson(`/api/catalog/ingredients/${id}/active`, { active })
      setIsMutating(false)
    },
    [data, mutate],
  )

  return { ingredients: data ?? [], isLoading, isMutating, create, update, toggle }
}
