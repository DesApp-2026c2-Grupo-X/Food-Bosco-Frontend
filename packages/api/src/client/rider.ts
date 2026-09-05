import { gql } from '@apollo/client'
import type {
  OrderStatus,
  RiderProfile,
  Trip,
  TripOffer,
  TripOrder,
  TripStatus,
} from '@repo/domain'

type Raw = Record<string, unknown>

const asString = (value: unknown, fallback = ''): string =>
  value == null ? fallback : String(value)

const asNumber = (value: unknown): number => (value == null ? 0 : Number(value))

const nullableString = (value: unknown): string | null => (value == null ? null : String(value))

const nullableNumber = (value: unknown): number | null => (value == null ? null : Number(value))

const asList = <T>(value: unknown, map: (raw: Raw) => T): T[] =>
  Array.isArray(value) ? value.map((entry) => map(entry as Raw)) : []

const GEO_POINT_FIELDS = `
  latitude
  longitude
`

const TRIP_ADDRESS_FIELDS = `
  text
  latitude
  longitude
`

const RIDER_FIELDS = `
  id
  userId
  firstName
  lastName
  vehicle
  phone
  available
  currentLocation {
    ${GEO_POINT_FIELDS}
  }
`

const TRIP_ORDER_FIELDS = `
  orderId
  pickupBranchId
  pickupLocation {
    ${GEO_POINT_FIELDS}
  }
  deliveryAddress {
    ${TRIP_ADDRESS_FIELDS}
  }
  status
  pickedUpAt
  deliveredAt
`

const TRIP_OFFER_FIELDS = `
  id
  orderCount
  distanceKm
  estimatedMinutes
  estimatedEarnings
  expiresAt
`

const TRIP_FIELDS = `
  id
  riderId
  status
  orders {
    ${TRIP_ORDER_FIELDS}
  }
  distanceKm
  estimatedMinutes
  estimatedEarnings
  earnings
  startedAt
  completedAt
  expiresAt
`

const toGeoPoint = (raw: Raw | null | undefined) => ({
  latitude: asNumber((raw as Raw | undefined)?.latitude),
  longitude: asNumber((raw as Raw | undefined)?.longitude),
})

export const toRider = (raw: Raw): RiderProfile => ({
  id: asString(raw.id),
  userId: asString(raw.userId),
  firstName: nullableString(raw.firstName),
  lastName: nullableString(raw.lastName),
  vehicle: nullableString(raw.vehicle),
  phone: nullableString(raw.phone),
  available: Boolean(raw.available),
  currentLocation: raw.currentLocation ? toGeoPoint(raw.currentLocation as Raw) : null,
})

export const toTripOrder = (raw: Raw): TripOrder => ({
  orderId: asString(raw.orderId),
  pickupBranchId: asString(raw.pickupBranchId),
  pickupLocation: toGeoPoint(raw.pickupLocation as Raw),
  deliveryAddress: {
    text: asString((raw.deliveryAddress as Raw | undefined)?.text),
    latitude: asNumber((raw.deliveryAddress as Raw | undefined)?.latitude),
    longitude: asNumber((raw.deliveryAddress as Raw | undefined)?.longitude),
  },
  status: asString(raw.status) as OrderStatus,
  pickedUpAt: nullableString(raw.pickedUpAt),
  deliveredAt: nullableString(raw.deliveredAt),
})

export const toTripOffer = (raw: Raw): TripOffer => ({
  id: asString(raw.id),
  orderCount: asNumber(raw.orderCount),
  distanceKm: asNumber(raw.distanceKm),
  estimatedMinutes: asNumber(raw.estimatedMinutes),
  estimatedEarnings: asNumber(raw.estimatedEarnings),
  expiresAt: nullableString(raw.expiresAt),
})

export const toTrip = (raw: Raw): Trip => ({
  id: asString(raw.id),
  riderId: asString(raw.riderId),
  status: asString(raw.status) as TripStatus,
  orders: asList(raw.orders, toTripOrder),
  distanceKm: asNumber(raw.distanceKm),
  estimatedMinutes: asNumber(raw.estimatedMinutes),
  estimatedEarnings: asNumber(raw.estimatedEarnings),
  earnings: nullableNumber(raw.earnings),
  startedAt: nullableString(raw.startedAt),
  completedAt: nullableString(raw.completedAt),
  expiresAt: nullableString(raw.expiresAt),
})

export const RIDER_PROFILE = gql`
  query RiderProfile {
    riderProfile {
      ${RIDER_FIELDS}
    }
  }
`

export const TRIP_OFFERS = gql`
  query TripOffers {
    tripOffers {
      ${TRIP_OFFER_FIELDS}
    }
  }
`

export const MY_TRIPS = gql`
  query MyTrips {
    myTrips {
      ${TRIP_FIELDS}
    }
  }
`

export const TRIP = gql`
  query Trip($id: ID!) {
    trip(id: $id) {
      ${TRIP_FIELDS}
    }
  }
`

export const UPDATE_RIDER_PROFILE = gql`
  mutation UpdateRiderProfile($input: UpdateRiderProfileInput!) {
    updateRiderProfile(input: $input) {
      ${RIDER_FIELDS}
    }
  }
`

export const SET_RIDER_AVAILABILITY = gql`
  mutation SetRiderAvailability($online: Boolean!) {
    setRiderAvailability(online: $online) {
      ${RIDER_FIELDS}
    }
  }
`

export const UPDATE_RIDER_LOCATION = gql`
  mutation UpdateRiderLocation($lat: Float!, $lng: Float!) {
    updateRiderLocation(lat: $lat, lng: $lng) {
      ${RIDER_FIELDS}
    }
  }
`

export const ACCEPT_TRIP_OFFER = gql`
  mutation AcceptTripOffer($offerId: ID!) {
    acceptTripOffer(offerId: $offerId) {
      ${TRIP_FIELDS}
    }
  }
`

export const REJECT_TRIP_OFFER = gql`
  mutation RejectTripOffer($offerId: ID!) {
    rejectTripOffer(offerId: $offerId)
  }
`

export const MARK_ORDER_PICKUP = gql`
  mutation MarkOrderPickup($tripId: ID!, $orderId: ID!) {
    markOrderPickup(tripId: $tripId, orderId: $orderId) {
      ${TRIP_FIELDS}
    }
  }
`

export const MARK_ORDER_DELIVERED = gql`
  mutation MarkOrderDelivered($tripId: ID!, $orderId: ID!) {
    markOrderDelivered(tripId: $tripId, orderId: $orderId) {
      ${TRIP_FIELDS}
    }
  }
`
