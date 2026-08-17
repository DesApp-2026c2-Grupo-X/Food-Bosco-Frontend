import useSWR from 'swr'
import type { Product } from '@repo/domain'
import { getJson } from '../client/rest'
import { getProductById } from '../mocks/catalog'

interface UseProductReturn {
  product: Product | null
  isLoading: boolean
}

export const useProduct = (productId: number | undefined): UseProductReturn => {
  const { data, isLoading } = useSWR<Product | null>(
    productId ? `/api/products/${productId}` : null,
    async (url: string) => {
      const json = await getJson<Product>(url)
      if (json && typeof json === 'object' && 'id' in json) {
        return json
      }
      return productId ? (getProductById(productId) ?? null) : null
    },
  )

  return { product: data ?? null, isLoading }
}
