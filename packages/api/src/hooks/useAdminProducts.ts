import { useCallback, useState } from 'react'
import useSWR from 'swr'
import type { Product } from '@repo/domain'
import { getJson, patchJson } from '../client/rest'
import { getCategoryName, MOCK_PRODUCTS } from '../mocks/catalog'

const KEY = '/api/catalog/products'

export interface AdminProductRow {
  product: Product
  categoryName: string
}

interface UseAdminProductsReturn {
  products: AdminProductRow[]
  isLoading: boolean
  isToggling: boolean
  setAvailable: (productId: number, available: boolean) => Promise<void>
}

const toRows = (products: Product[]): AdminProductRow[] =>
  products.map((product) => ({
    product,
    categoryName: getCategoryName(product.categoryId) ?? 'Sin categoría',
  }))

export const useAdminProducts = (): UseAdminProductsReturn => {
  const { data, isLoading, mutate } = useSWR<AdminProductRow[]>(KEY, async (url: string) => {
    const json = await getJson<AdminProductRow[]>(url)
    if (json && Array.isArray(json) && json.length > 0) return json
    return toRows(MOCK_PRODUCTS)
  })

  const [isToggling, setIsToggling] = useState(false)

  const setAvailable = useCallback(
    async (productId: number, available: boolean) => {
      setIsToggling(true)
      const current = data ?? toRows(MOCK_PRODUCTS)
      const next = current.map((row) =>
        row.product.id === productId
          ? { ...row, product: { ...row.product, available } }
          : row,
      )
      const mock = MOCK_PRODUCTS.find((product) => product.id === productId)
      if (mock) mock.available = available
      await mutate(next, { revalidate: false })
      await patchJson(`/api/catalog/products/${productId}/available`, { available })
      setIsToggling(false)
    },
    [data, mutate],
  )

  return { products: data ?? [], isLoading, isToggling, setAvailable }
}
