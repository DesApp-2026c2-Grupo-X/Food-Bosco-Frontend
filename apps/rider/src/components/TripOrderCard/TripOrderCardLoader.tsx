import { useOrder } from '@repo/api'
import { TripOrderCard } from './index'
import type { TripOrderCardProps } from './types'

export const TripOrderCardLoader = (props: Omit<TripOrderCardProps, 'order'>) => {
  const { order } = useOrder(props.tripOrder.orderId)

  return <TripOrderCard {...props} order={order} />
}
