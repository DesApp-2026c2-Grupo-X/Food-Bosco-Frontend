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

export interface CustomerReportFilter {
  from?: string
  to?: string
  groupBy?: ReportGroupBy
}

export interface CustomerBranchReportRow {
  branchId: string
  branchName: string
  orders: number
  totalSpent: number
}

export interface CustomerReportSummary {
  totalOrders: number
  completedOrders: number
  cancelledOrders: number
  activeOrders: number
  totalSpent: number
  averageTicket: number
  favoriteBranch: CustomerBranchReportRow | null
}

export interface CustomerActivityPoint {
  bucket: string
  orders: number
  completedOrders: number
  totalSpent: number
}

export interface CustomerProductRow {
  productId: string
  name: string
  quantity: number
  orders: number
  totalSpent: number
}

export interface CustomerReportsOverview {
  period: ReportPeriod
  summary: CustomerReportSummary
  activitySeries: CustomerActivityPoint[]
  frequentProducts: CustomerProductRow[]
  ordersByStatus: OrderStatusCount[]
}
