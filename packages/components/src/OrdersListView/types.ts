import type { Order } from '@repo/domain'
import type { ResponsiveBreakpoint } from '../DataTable/types'

export interface OrdersListViewProps {
  orders: Order[]
  isLoading: boolean
  description: string
  orderDetailPath: (id: string) => string
  showBranchFilter?: boolean
  branchColumnHideBelow?: ResponsiveBreakpoint
}
