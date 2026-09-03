import { useQuery } from '@apollo/client'
import type { Product } from '@repo/domain'
import { PRODUCT, toProduct } from '../client/store'

interface UseProductReturn {
  product: Product | null
  isLoading: boolean
}

interface ProductResult {
  product: Record<string, unknown> | null
}

export const useProduct = (productId: string | undefined): UseProductReturn => {
  const { data, loading } = useQuery<ProductResult>(PRODUCT, {
    variables: { id: productId },
    skip: !productId,
  })

  return {
    product: data?.product ? toProduct(data.product) : null,
    isLoading: loading,
  }
}
