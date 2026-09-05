import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import type { Ingredient, IngredientInput } from '@repo/domain'
import {
  ADMIN_INGREDIENTS,
  CREATE_INGREDIENT,
  SET_INGREDIENT_ACTIVE,
  UPDATE_INGREDIENT,
  toIngredient,
} from '../client/admin'

interface UseIngredientsReturn {
  ingredients: Ingredient[]
  isLoading: boolean
  isMutating: boolean
  create: (input: IngredientInput) => Promise<void>
  update: (id: string, input: IngredientInput) => Promise<void>
  toggle: (id: string, active: boolean) => Promise<void>
}

interface IngredientsResult {
  ingredients: Record<string, unknown>[]
}

export const useIngredients = (): UseIngredientsReturn => {
  const { data, loading, refetch } = useQuery<IngredientsResult>(ADMIN_INGREDIENTS, {
    fetchPolicy: 'network-only',
  })

  const [createMutation, { loading: creating }] = useMutation(CREATE_INGREDIENT)
  const [updateMutation, { loading: updating }] = useMutation(UPDATE_INGREDIENT)
  const [setActiveMutation, { loading: toggling }] = useMutation(SET_INGREDIENT_ACTIVE)

  const create = useCallback(
    async (input: IngredientInput) => {
      await createMutation({ variables: { input } })
      await refetch()
    },
    [createMutation, refetch],
  )

  const update = useCallback(
    async (id: string, input: IngredientInput) => {
      await updateMutation({ variables: { id, input } })
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

  return {
    ingredients: (data?.ingredients ?? []).map(toIngredient),
    isLoading: loading,
    isMutating: creating || updating || toggling,
    create,
    update,
    toggle,
  }
}
