import type { Ingredient, IngredientInput } from '@repo/domain'
import {
  ADMIN_INGREDIENTS,
  CREATE_INGREDIENT,
  SET_INGREDIENT_ACTIVE,
  UPDATE_INGREDIENT,
  toIngredient,
} from '../client/admin'
import { createCrudResource } from './createCrudResource'

interface UseIngredientsReturn {
  ingredients: Ingredient[]
  isLoading: boolean
  isMutating: boolean
  create: (input: IngredientInput) => Promise<void>
  update: (id: string, input: IngredientInput) => Promise<void>
  toggle: (id: string, active: boolean) => Promise<void>
}

const useIngredientsResource = createCrudResource({
  query: {
    document: ADMIN_INGREDIENTS,
    resultKey: 'ingredients',
    map: toIngredient,
    fetchPolicy: 'network-only',
  },
  create: {
    document: CREATE_INGREDIENT,
    variables: (input: IngredientInput) => ({ input }),
  },
  update: {
    document: UPDATE_INGREDIENT,
    variables: (id: string, input: IngredientInput) => ({ id, input }),
  },
  toggle: {
    document: SET_INGREDIENT_ACTIVE,
    variables: (id: string, active: boolean) => ({ id, active }),
  },
})

export const useIngredients: () => UseIngredientsReturn = useIngredientsResource
