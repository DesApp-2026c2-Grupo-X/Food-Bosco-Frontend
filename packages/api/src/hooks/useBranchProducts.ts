import { useCallback, useState } from 'react'
import useSWR from 'swr'
import type { BranchProduct } from '@repo/domain'
import { getJson, patchJson } from '../client/rest'
import { MOCK_BRANCH_PRODUCTS } from '../mocks/branch-products'

const KEY = '/api/branches/current/products'

interface UseBranchProductsReturn {
  products: BranchProduct[]
  isLoading: boolean
  isToggling: boolean
  setAvailability: (productId: number, available: boolean) => Promise<void>
}

export const useBranchProducts = (): UseBranchProductsReturn => {
  const { data, isLoading, mutate } = useSWR<BranchProduct[]>(KEY, async (url: string) => {
    const json = await getJson<BranchProduct[]>(url)
    if (json && Array.isArray(json) && json.length > 0) {
      return json
    }
    return MOCK_BRANCH_PRODUCTS
  })

  const [isToggling, setIsToggling] = useState(false)

  const setAvailability = useCallback(
    async (productId: number, available: boolean) => {
      setIsToggling(true)

      const updated = (data ?? MOCK_BRANCH_PRODUCTS).map((item) =>
        item.product.id === productId ? { ...item, available } : item,
      )
      const mockItem = MOCK_BRANCH_PRODUCTS.find((item) => item.product.id === productId)
      if (mockItem) mockItem.available = available

      await mutate(updated, { revalidate: false })
      await patchJson(`/api/branches/current/products/${productId}/availability`, { available })
      setIsToggling(false)
    },
    [data, mutate],
  )

  return { products: data ?? [], isLoading, isToggling, setAvailability }
}
