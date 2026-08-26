import useSWR from 'swr'
import type { Category, Product } from '@repo/domain'
import { getJson } from '../client/rest'
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../mocks/catalog'

interface CatalogResponse {
  categories: Category[]
  products: Product[]
}

interface UseCatalogReturn {
  categories: Category[]
  products: Product[]
  isLoading: boolean
}

const MOCK: CatalogResponse = { categories: MOCK_CATEGORIES, products: MOCK_PRODUCTS }

export const useCatalog = (): UseCatalogReturn => {
  const { data, isLoading } = useSWR<CatalogResponse>('/api/catalog', async (url: string) => {
    const json = await getJson<CatalogResponse>(url)
    if (json && Array.isArray(json.categories) && Array.isArray(json.products)) {
      return json
    }
    return MOCK
  })

  return {
    categories: data?.categories ?? [],
    products: data?.products ?? [],
    isLoading,
  }
}
