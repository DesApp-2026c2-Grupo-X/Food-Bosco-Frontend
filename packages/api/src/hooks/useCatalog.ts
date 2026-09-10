import { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import type { Category, Product } from '@repo/domain'
import { CATEGORIES, PRODUCTS, toCategory, toProduct } from '../client/store'

interface UseCatalogReturn {
  categories: Category[]
  products: Product[]
  isLoading: boolean
}

interface CategoriesResult {
  categories: Record<string, unknown>[]
}

interface ProductsResult {
  products: Record<string, unknown>[]
}

export const useCatalog = (lat?: number | null, lng?: number | null): UseCatalogReturn => {
  const { data: categoriesData, loading: categoriesLoading } =
    useQuery<CategoriesResult>(CATEGORIES)
  const { data: productsData, loading: productsLoading } = useQuery<ProductsResult>(PRODUCTS, {
    variables: { filter: { lat: lat ?? null, lng: lng ?? null } },
  })

  const categories = useMemo(
    () => (categoriesData?.categories ?? []).map(toCategory),
    [categoriesData],
  )
  const products = useMemo(
    () => (productsData?.products ?? []).map(toProduct).filter((product) => product.available),
    [productsData],
  )

  return {
    categories,
    products,
    isLoading: categoriesLoading || productsLoading,
  }
}
