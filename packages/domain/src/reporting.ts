import type { Category, Product } from './catalog'
import type { OrderStatus } from './order'

export interface ProductReportRow {
  position: number
  product: Product
  category?: Category
  quantity?: number
  revenue?: number
}

export interface OutOfStockRow {
  product: Product
  category?: Category
  quantity: number
}

export type ReportGroupBy = 'DAY' | 'WEEK' | 'MONTH'

export interface ReportFilter {
  from?: string
  to?: string
  branchId?: string
  groupBy?: ReportGroupBy
  categoryId?: string
  status?: OrderStatus
}

export interface ReportPeriod {
  from: string
  to: string
}

export interface ProductSalesRow {
  productId: string
  name: string
  quantity: number
  revenue: number
}

export interface BranchPerformanceRow {
  branchId: string
  branchName: string
  revenue: number
  orders: number
}

export interface ReportKpis {
  totalRevenue: number
  totalOrders: number
  averageTicket: number
  cancelledOrders: number
  bestSellingProduct: ProductSalesRow | null
  topBranch: BranchPerformanceRow | null
}

export interface ReportVariation {
  revenuePct: number | null
  ordersPct: number | null
  averageTicketPct: number | null
}

export interface SalesSeriesPoint {
  bucket: string
  revenue: number
  orders: number
}

export interface OrderStatusCount {
  status: OrderStatus
  count: number
}

export interface ReportsOverview {
  period: ReportPeriod
  kpis: ReportKpis
  variation: ReportVariation
  salesSeries: SalesSeriesPoint[]
  ordersByStatus: OrderStatusCount[]
  topProducts: ProductSalesRow[]
  branchPerformance: BranchPerformanceRow[]
}
