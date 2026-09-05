import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import type { Promotion, PromotionInput } from '@repo/domain'
import {
  ADMIN_PROMOTIONS,
  CREATE_PROMOTION,
  SET_PROMOTION_ACTIVE,
  UPDATE_PROMOTION,
  toPromotion,
} from '../client/admin'

interface UsePromotionsReturn {
  promotions: Promotion[]
  isLoading: boolean
  isMutating: boolean
  create: (input: PromotionInput) => Promise<void>
  update: (id: string, input: PromotionInput) => Promise<void>
  toggle: (id: string, active: boolean) => Promise<void>
}

interface PromotionsResult {
  promotions: Record<string, unknown>[]
}

export const usePromotions = (): UsePromotionsReturn => {
  const { data, loading, refetch } = useQuery<PromotionsResult>(ADMIN_PROMOTIONS, {
    fetchPolicy: 'network-only',
  })

  const [createMutation, { loading: creating }] = useMutation(CREATE_PROMOTION)
  const [updateMutation, { loading: updating }] = useMutation(UPDATE_PROMOTION)
  const [setActiveMutation, { loading: toggling }] = useMutation(SET_PROMOTION_ACTIVE)

  const create = useCallback(
    async (input: PromotionInput) => {
      await createMutation({ variables: { input } })
      await refetch()
    },
    [createMutation, refetch],
  )

  const update = useCallback(
    async (id: string, input: PromotionInput) => {
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
    promotions: (data?.promotions ?? []).map(toPromotion),
    isLoading: loading,
    isMutating: creating || updating || toggling,
    create,
    update,
    toggle,
  }
}
