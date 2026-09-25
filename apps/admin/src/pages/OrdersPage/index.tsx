import { OrdersListView } from '@repo/components'
import { useGlobalOrders } from '@repo/api'
import { orderDetailPath } from '../../routes'

export const OrdersPage = () => {
  const { orders, isLoading } = useGlobalOrders()

  return (
    <OrdersListView
      orders={orders}
      isLoading={isLoading}
      description="Consultá y operá los pedidos de todas las sucursales."
      orderDetailPath={orderDetailPath}
      showBranchFilter
    />
  )
}
