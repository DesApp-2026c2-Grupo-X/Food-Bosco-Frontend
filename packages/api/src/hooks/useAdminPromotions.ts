import type { Promotion, PromotionInput } from '@repo/domain'
import {
  CREATE_PROMOTION,
  DELETE_PROMOTION,
  PROMOTIONS,
  SET_PROMOTION_ACTIVE,
  UPDATE_PROMOTION,
  toPromotion,
} from '../client/admin'
import { createCrudResource } from './createCrudResource'

export interface UseAdminPromotionsReturn {
  promotions: Promotion[]
  isLoading: boolean
  isMutating: boolean
  create: (input: PromotionInput) => Promise<void>
  update: (id: string, input: PromotionInput) => Promise<void>
  toggle: (id: string, active: boolean) => Promise<void>
  remove: (id: string) => Promise<void>
}

const useAdminPromotionsResource = createCrudResource({
  query: {
    document: PROMOTIONS,
    resultKey: 'promotions',
    map: toPromotion,
    fetchPolicy: 'network-only',
  },
  create: {
    document: CREATE_PROMOTION,
    variables: (input: PromotionInput) => ({ input }),
  },
  update: {
    document: UPDATE_PROMOTION,
    variables: (id: string, input: PromotionInput) => ({ id, input }),
  },
  toggle: {
    document: SET_PROMOTION_ACTIVE,
    variables: (id: string, active: boolean) => ({ id, active }),
  },
  remove: {
    document: DELETE_PROMOTION,
    variables: (id: string) => ({ id }),
  },
})

export const useAdminPromotions: () => UseAdminPromotionsReturn = useAdminPromotionsResource
