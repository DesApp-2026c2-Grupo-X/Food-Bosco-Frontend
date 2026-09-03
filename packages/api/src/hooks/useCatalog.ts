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

export const useCatalog = (): UseCatalogReturn => {
  const { data: categoriesData, loading: categoriesLoading } =
    useQuery<CategoriesResult>(CATEGORIES)
  const { data: productsData, loading: productsLoading } = useQuery<ProductsResult>(PRODUCTS)

  return {
    categories: (categoriesData?.categories ?? []).map(toCategory),
    products: (productsData?.products ?? []).map(toProduct),
    isLoading: categoriesLoading || productsLoading,
  }
}
