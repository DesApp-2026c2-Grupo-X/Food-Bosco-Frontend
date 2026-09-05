import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import type { BranchProduct } from '@repo/domain'
import { BRANCH_PRODUCTS, SET_BRANCH_PRODUCT_AVAILABILITY, toBranchProduct } from '../client/branch'
import { useAuthStore } from '../stores/authStore'

interface UseBranchProductsReturn {
  products: BranchProduct[]
  isLoading: boolean
  isToggling: boolean
  setAvailability: (productId: string, available: boolean) => Promise<void>
}

interface BranchProductsResult {
  branchProducts: Record<string, unknown>[]
}

export const useBranchProducts = (): UseBranchProductsReturn => {
  const branchId = useAuthStore((state) => state.user?.branchId)

  const { data, loading, refetch } = useQuery<BranchProductsResult>(BRANCH_PRODUCTS, {
    variables: { branchId },
    skip: !branchId,
    fetchPolicy: 'network-only',
  })

  const [setAvailabilityMutation, { loading: toggling }] = useMutation(
    SET_BRANCH_PRODUCT_AVAILABILITY,
  )

  const setAvailability = useCallback(
    async (productId: string, available: boolean) => {
      if (!branchId) return
      await setAvailabilityMutation({ variables: { branchId, productId, available } })
      await refetch()
    },
    [branchId, setAvailabilityMutation, refetch],
  )

  return {
    products: (data?.branchProducts ?? []).map(toBranchProduct),
    isLoading: loading,
    isToggling: toggling,
    setAvailability,
  }
}
