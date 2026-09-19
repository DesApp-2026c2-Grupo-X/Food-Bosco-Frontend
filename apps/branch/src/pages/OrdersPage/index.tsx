import { OrdersListView } from '@repo/components'
import { useBranchOrders } from '@repo/api'
import { orderDetailPath } from '../../routes'

export const OrdersPage = () => {
  const { orders, isLoading } = useBranchOrders()

  return (
    <OrdersListView
      orders={orders}
      isLoading={isLoading}
      description="Consultá y operá los pedidos de tu sucursal."
      orderDetailPath={orderDetailPath}
      branchColumnHideBelow="lg"
    />
  )
}
