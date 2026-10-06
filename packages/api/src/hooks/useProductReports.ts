import { useQuery } from '@apollo/client'
import type { OutOfStockRow, ProductReportRow, ReportFilter } from '@repo/domain'
import {
  BEST_SELLING_PRODUCTS,
  HIGHEST_REVENUE_PRODUCTS,
  LEAST_SOLD_PRODUCTS,
  OUT_OF_STOCK_PRODUCTS,
  toOutOfStockRow,
  toProductReportRow,
} from '../client/admin'
import { combineLoading } from '../utils/combineLoading'

interface ProductReports {
  bestSellers: ProductReportRow[]
  leastSold: ProductReportRow[]
  outOfStock: OutOfStockRow[]
  highestRevenue: ProductReportRow[]
}

interface UseProductReportsReturn extends ProductReports {
  isLoading: boolean
  error: boolean
}

interface ReportRowsResult {
  bestSellingProducts: Record<string, unknown>[]
  leastSoldProducts: Record<string, unknown>[]
  outOfStockProducts: Record<string, unknown>[]
  highestRevenueProducts: Record<string, unknown>[]
}

export const useProductReports = (filter: ReportFilter = {}): UseProductReportsReturn => {
  const options = { variables: { filter }, fetchPolicy: 'network-only' as const }

  const {
    data: bestData,
    loading: bestLoading,
    error: bestError,
  } = useQuery<ReportRowsResult>(BEST_SELLING_PRODUCTS, options)
  const {
    data: leastData,
    loading: leastLoading,
    error: leastError,
  } = useQuery<ReportRowsResult>(LEAST_SOLD_PRODUCTS, options)
  const {
    data: outData,
    loading: outLoading,
    error: outError,
  } = useQuery<ReportRowsResult>(OUT_OF_STOCK_PRODUCTS, options)
  const {
    data: revenueData,
    loading: revenueLoading,
    error: revenueError,
  } = useQuery<ReportRowsResult>(HIGHEST_REVENUE_PRODUCTS, options)

  return {
    bestSellers: (bestData?.bestSellingProducts ?? []).map(toProductReportRow),
    leastSold: (leastData?.leastSoldProducts ?? []).map(toProductReportRow),
    outOfStock: (outData?.outOfStockProducts ?? []).map(toOutOfStockRow),
    highestRevenue: (revenueData?.highestRevenueProducts ?? []).map(toProductReportRow),
    isLoading: combineLoading(bestLoading, leastLoading, outLoading, revenueLoading),
    error: Boolean(bestError || leastError || outError || revenueError),
  }
}
