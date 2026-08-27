import useSWR from 'swr'
import type { OutOfStockRow, ProductReportRow } from '@repo/domain'
import { getJson } from '../client/rest'
import {
  MOCK_BEST_SELLERS,
  MOCK_HIGHEST_REVENUE,
  MOCK_LEAST_SOLD,
  MOCK_OUT_OF_STOCK,
} from '../mocks/reports'

interface ProductReports {
  bestSellers: ProductReportRow[]
  leastSold: ProductReportRow[]
  outOfStock: OutOfStockRow[]
  highestRevenue: ProductReportRow[]
}

const MOCK: ProductReports = {
  bestSellers: MOCK_BEST_SELLERS,
  leastSold: MOCK_LEAST_SOLD,
  outOfStock: MOCK_OUT_OF_STOCK,
  highestRevenue: MOCK_HIGHEST_REVENUE,
}

interface UseProductReportsReturn extends ProductReports {
  isLoading: boolean
}

export const useProductReports = (): UseProductReportsReturn => {
  const { data, isLoading } = useSWR<ProductReports>(
    '/api/reporting/products',
    async (url: string) => {
      const json = await getJson<ProductReports>(url)
      if (json && Array.isArray(json.bestSellers) && Array.isArray(json.leastSold)) {
        return json
      }
      return MOCK
    },
  )

  return {
    bestSellers: data?.bestSellers ?? [],
    leastSold: data?.leastSold ?? [],
    outOfStock: data?.outOfStock ?? [],
    highestRevenue: data?.highestRevenue ?? [],
    isLoading,
  }
}
