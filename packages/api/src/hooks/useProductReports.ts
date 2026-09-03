import { useQuery } from '@apollo/client'
import type { OutOfStockRow, ProductReportRow } from '@repo/domain'
import {
  BEST_SELLING_PRODUCTS,
  HIGHEST_REVENUE_PRODUCTS,
  LEAST_SOLD_PRODUCTS,
  OUT_OF_STOCK_PRODUCTS,
  toOutOfStockRow,
  toProductReportRow,
} from '../client/admin'

interface ProductReports {
  bestSellers: ProductReportRow[]
  leastSold: ProductReportRow[]
  outOfStock: OutOfStockRow[]
  highestRevenue: ProductReportRow[]
}

interface UseProductReportsReturn extends ProductReports {
  isLoading: boolean
}

interface ReportRowsResult {
  bestSellingProducts: Record<string, unknown>[]
  leastSoldProducts: Record<string, unknown>[]
  outOfStockProducts: Record<string, unknown>[]
  highestRevenueProducts: Record<string, unknown>[]
}

export const useProductReports = (): UseProductReportsReturn => {
  const { data: bestData, loading: bestLoading } =
    useQuery<ReportRowsResult>(BEST_SELLING_PRODUCTS)
  const { data: leastData, loading: leastLoading } =
    useQuery<ReportRowsResult>(LEAST_SOLD_PRODUCTS)
  const { data: outData, loading: outLoading } =
    useQuery<ReportRowsResult>(OUT_OF_STOCK_PRODUCTS)
  const { data: revenueData, loading: revenueLoading } =
    useQuery<ReportRowsResult>(HIGHEST_REVENUE_PRODUCTS)

  return {
    bestSellers: (bestData?.bestSellingProducts ?? []).map(toProductReportRow),
    leastSold: (leastData?.leastSoldProducts ?? []).map(toProductReportRow),
    outOfStock: (outData?.outOfStockProducts ?? []).map(toOutOfStockRow),
    highestRevenue: (revenueData?.highestRevenueProducts ?? []).map(toProductReportRow),
    isLoading: bestLoading || leastLoading || outLoading || revenueLoading,
  }
}
