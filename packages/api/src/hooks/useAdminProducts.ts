import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import type { Product } from '@repo/domain'
import { ADMIN_PRODUCTS, SET_PRODUCT_AVAILABLE, toProduct } from '../client/admin'

export interface AdminProductRow {
  product: Product
  categoryName: string
}

interface UseAdminProductsReturn {
  products: AdminProductRow[]
  isLoading: boolean
  isToggling: boolean
  setAvailable: (productId: string, available: boolean) => Promise<void>
}

interface ProductsResult {
  products: Record<string, unknown>[]
}

const toRows = (products: Record<string, unknown>[]): AdminProductRow[] =>
  products.map((raw) => {
    const category = raw.category as Record<string, unknown> | undefined
    return {
      product: toProduct(raw),
      categoryName: category?.name != null ? String(category.name) : 'Sin categoría',
    }
  })

export const useAdminProducts = (): UseAdminProductsReturn => {
  const { data, loading, refetch } = useQuery<ProductsResult>(ADMIN_PRODUCTS, {
    fetchPolicy: 'network-only',
  })

  const [setAvailableMutation, { loading: toggling }] = useMutation(SET_PRODUCT_AVAILABLE)

  const setAvailable = useCallback(
    async (productId: string, available: boolean) => {
      await setAvailableMutation({ variables: { id: productId, available } })
      await refetch()
    },
    [setAvailableMutation, refetch],
  )

  return {
    products: toRows(data?.products ?? []),
    isLoading: loading,
    isToggling: toggling,
    setAvailable,
  }
}
