import type { Category, CategoryInput } from '@repo/domain'
import {
  ADMIN_CATEGORIES,
  CREATE_CATEGORY,
  SET_CATEGORY_ACTIVE,
  UPDATE_CATEGORY,
  toCategory,
} from '../client/admin'
import { createCrudResource } from './createCrudResource'

interface UseAdminCategoriesReturn {
  categories: Category[]
  isLoading: boolean
  isMutating: boolean
  create: (input: CategoryInput) => Promise<void>
  update: (id: string, input: CategoryInput) => Promise<void>
  toggle: (id: string, active: boolean) => Promise<void>
  remove: (id: string) => Promise<void>
}

const useAdminCategoriesResource = createCrudResource({
  query: {
    document: ADMIN_CATEGORIES,
    resultKey: 'categories',
    map: toCategory,
    fetchPolicy: 'network-only',
  },
  create: {
    document: CREATE_CATEGORY,
    variables: (input: CategoryInput) => ({ input }),
  },
  update: {
    document: UPDATE_CATEGORY,
    variables: (id: string, input: CategoryInput) => ({ id, input }),
  },
  toggle: {
    document: SET_CATEGORY_ACTIVE,
    variables: (id: string, active: boolean) => ({ id, active }),
  },
  remove: {
    document: SET_CATEGORY_ACTIVE,
    variables: (id: string) => ({ id, active: false }),
  },
})

export const useAdminCategories: () => UseAdminCategoriesReturn = useAdminCategoriesResource
