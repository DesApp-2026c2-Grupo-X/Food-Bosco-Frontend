import type { Order, Trip, TripOffer, TripOrder } from '@repo/domain'
import { getOrderById } from './orders'

const ago = (minutes: number) => new Date(Date.now() - minutes * 60000).toISOString()

const order = (id: string): Order => {
  const found = getOrderById(id)
  if (!found) throw new Error(`Order mock not found: ${id}`)
  return found
}

const readyForDelivery = (id: string): Order => ({ ...order(id), status: 'READY_FOR_DELIVERY' })

const deliveredOrder = (id: string): Order => ({ ...order(id), status: 'DELIVERED' })

const deliveredTripOrder = (id: string): TripOrder => ({
  order: deliveredOrder(id),
  pickedUp: true,
  delivered: true,
})

const buildOffer = (): TripOffer => ({
  id: 'offer-1',
  orders: [readyForDelivery('o-126'), readyForDelivery('o-129')],
  distanceKm: 4.8,
  estimatedMinutes: 32,
  estimatedEarnings: 5200,
  expiresAt: new Date(Date.now() + 45000).toISOString(),
})

const createTripFromOffer = (offer: TripOffer): Trip => ({
  id: 'trip-active',
  riderId: 'rider-1',
  status: 'ACTIVE',
  orders: offer.orders.map((order) => ({ order, pickedUp: false, delivered: false })),
  distanceKm: offer.distanceKm,
  startedAt: new Date().toISOString(),
  earnings: offer.estimatedEarnings,
})

let currentOffer: TripOffer | null = buildOffer()
let activeTrip: Trip | null = null

const completedTrips: Trip[] = [
  {
    id: 'trip-3',
    riderId: 'rider-1',
    status: 'COMPLETED',
    orders: [deliveredTripOrder('o-98')],
    distanceKm: 3.2,
    startedAt: ago(60 * 24 + 20),
    completedAt: ago(60 * 24),
    earnings: 3800,
  },
  {
    id: 'trip-2',
    riderId: 'rider-1',
    status: 'COMPLETED',
    orders: [deliveredTripOrder('o-126'), deliveredTripOrder('o-129')],
    distanceKm: 6.1,
    startedAt: ago(60 * 24 * 2 + 30),
    completedAt: ago(60 * 24 * 2),
    earnings: 7400,
  },
  {
    id: 'trip-1',
    riderId: 'rider-1',
    status: 'COMPLETED',
    orders: [deliveredTripOrder('o-127')],
    distanceKm: 2.5,
    startedAt: ago(60 * 24 * 5 + 25),
    completedAt: ago(60 * 24 * 5),
    earnings: 2900,
  },
]

export const getCurrentOffer = (): TripOffer | null => currentOffer

export const getActiveTrip = (): Trip | null => activeTrip

export const getMyTrips = (): Trip[] =>
  [...completedTrips].sort(
    (a, b) => new Date(b.completedAt ?? 0).getTime() - new Date(a.completedAt ?? 0).getTime(),
  )

export const acceptOffer = (offerId: string): Trip | null => {
  if (!currentOffer || currentOffer.id !== offerId) return activeTrip
  activeTrip = createTripFromOffer(currentOffer)
  currentOffer = null
  return activeTrip
}

export const rejectOffer = (offerId: string): void => {
  if (currentOffer?.id === offerId) currentOffer = null
}

export const pickupOrder = (tripId: string, orderId: string): Trip | null => {
  if (!activeTrip || activeTrip.id !== tripId) return activeTrip
  activeTrip = {
    ...activeTrip,
    orders: activeTrip.orders.map((tripOrder) =>
      tripOrder.order.id === orderId ? { ...tripOrder, pickedUp: true } : tripOrder,
    ),
  }
  return activeTrip
}

export const deliverOrder = (tripId: string, orderId: string): Trip | null => {
  if (!activeTrip || activeTrip.id !== tripId) return activeTrip

  const orders = activeTrip.orders.map((tripOrder) =>
    tripOrder.order.id === orderId ? { ...tripOrder, pickedUp: true, delivered: true } : tripOrder,
  )
  const allDelivered = orders.every((tripOrder) => tripOrder.delivered)

  const next: Trip = {
    ...activeTrip,
    orders,
    ...(allDelivered
      ? { status: 'COMPLETED' as const, completedAt: new Date().toISOString() }
      : {}),
  }

  if (allDelivered) {
    completedTrips.unshift(next)
    activeTrip = null
  } else {
    activeTrip = next
  }

  return next
}
