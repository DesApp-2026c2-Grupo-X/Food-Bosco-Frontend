import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import type { Category, CategoryInput } from '@repo/domain'
import {
  ADMIN_CATEGORIES,
  CREATE_CATEGORY,
  SET_CATEGORY_ACTIVE,
  UPDATE_CATEGORY,
  toCategory,
} from '../client/admin'

interface UseAdminCategoriesReturn {
  categories: Category[]
  isLoading: boolean
  isMutating: boolean
  create: (input: CategoryInput) => Promise<void>
  update: (id: string, name: string) => Promise<void>
  toggle: (id: string, active: boolean) => Promise<void>
  remove: (id: string) => Promise<void>
}

interface CategoriesResult {
  categories: Record<string, unknown>[]
}

export const useAdminCategories = (): UseAdminCategoriesReturn => {
  const { data, loading, refetch } = useQuery<CategoriesResult>(ADMIN_CATEGORIES, {
    fetchPolicy: 'network-only',
  })

  const [createMutation, { loading: creating }] = useMutation(CREATE_CATEGORY)
  const [updateMutation, { loading: updating }] = useMutation(UPDATE_CATEGORY)
  const [setActiveMutation, { loading: toggling }] = useMutation(SET_CATEGORY_ACTIVE)

  const create = useCallback(
    async (input: CategoryInput) => {
      await createMutation({ variables: { input } })
      await refetch()
    },
    [createMutation, refetch],
  )

  const update = useCallback(
    async (id: string, name: string) => {
      await updateMutation({ variables: { id, input: { name } } })
      await refetch()
    },
    [updateMutation, refetch],
  )

  const toggle = useCallback(
    async (id: string, active: boolean) => {
      await setActiveMutation({ variables: { id, active } })
      await refetch()
    },
    [setActiveMutation, refetch],
  )

  const remove = useCallback(
    async (id: string) => {
      await setActiveMutation({ variables: { id, active: false } })
      await refetch()
    },
    [setActiveMutation, refetch],
  )

  return {
    categories: (data?.categories ?? []).map(toCategory),
    isLoading: loading,
    isMutating: creating || updating || toggling,
    create,
    update,
    toggle,
    remove,
  }
}
