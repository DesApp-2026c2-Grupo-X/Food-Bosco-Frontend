import { useCallback, useState } from 'react'
import useSWR from 'swr'
import type { Category, CategoryInput } from '@repo/domain'
import { deleteJson, getJson, patchJson, postJson } from '../client/rest'
import { MOCK_CATEGORIES } from '../mocks/catalog'

const KEY = '/api/catalog/categories'

interface UseAdminCategoriesReturn {
  categories: Category[]
  isLoading: boolean
  isMutating: boolean
  create: (input: CategoryInput) => Promise<void>
  update: (id: number, name: string) => Promise<void>
  toggle: (id: number, active: boolean) => Promise<void>
  remove: (id: number) => Promise<void>
}

export const useAdminCategories = (): UseAdminCategoriesReturn => {
  const { data, isLoading, mutate } = useSWR<Category[]>(KEY, async (url: string) => {
    const json = await getJson<Category[]>(url)
    if (json && Array.isArray(json) && json.length > 0) return json
    return MOCK_CATEGORIES
  })

  const [isMutating, setIsMutating] = useState(false)

  const create = useCallback(
    async (input: CategoryInput) => {
      setIsMutating(true)
      const category: Category = {
        id: Date.now(),
        name: input.name,
        slug: input.name.toLowerCase().replace(/\s+/g, '-'),
        active: input.active,
      }
      MOCK_CATEGORIES.push(category)
      await mutate([...(data ?? MOCK_CATEGORIES)], { revalidate: false })
      await postJson('/api/catalog/categories', input)
      setIsMutating(false)
    },
    [data, mutate],
  )

  const update = useCallback(
    async (id: number, name: string) => {
      setIsMutating(true)
      const next = (data ?? MOCK_CATEGORIES).map((category) =>
        category.id === id
          ? { ...category, name, slug: name.toLowerCase().replace(/\s+/g, '-') }
          : category,
      )
      const mock = MOCK_CATEGORIES.find((category) => category.id === id)
      if (mock) {
        mock.name = name
        mock.slug = name.toLowerCase().replace(/\s+/g, '-')
      }
      await mutate(next, { revalidate: false })
      await patchJson(`/api/catalog/categories/${id}`, { name })
      setIsMutating(false)
    },
    [data, mutate],
  )

  const toggle = useCallback(
    async (id: number, active: boolean) => {
      setIsMutating(true)
      const next = (data ?? MOCK_CATEGORIES).map((category) =>
        category.id === id ? { ...category, active } : category,
      )
      const mock = MOCK_CATEGORIES.find((category) => category.id === id)
      if (mock) mock.active = active
      await mutate(next, { revalidate: false })
      await patchJson(`/api/catalog/categories/${id}/active`, { active })
      setIsMutating(false)
    },
    [data, mutate],
  )

  const remove = useCallback(
    async (id: number) => {
      setIsMutating(true)
      const next = (data ?? MOCK_CATEGORIES).filter((category) => category.id !== id)
      const index = MOCK_CATEGORIES.findIndex((category) => category.id === id)
      if (index !== -1) MOCK_CATEGORIES.splice(index, 1)
      await mutate(next, { revalidate: false })
      await deleteJson(`/api/catalog/categories/${id}`)
      setIsMutating(false)
    },
    [data, mutate],
  )

  return { categories: data ?? [], isLoading, isMutating, create, update, toggle, remove }
}
