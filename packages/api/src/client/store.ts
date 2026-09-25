import { gql } from '@apollo/client'
import type {
  Branch,
  BranchHours,
  Cart,
  CartItem,
  Category,
  Order,
  OrderItem,
  OrderItemOption,
  OrderStatus,
  OrderStatusHistory,
  Product,
  ProductConfigGroup,
  ProductOption,
} from '@repo/domain'
import { asBoolean, asList, asNumber, asString, toRecipeItem, toUser } from './mappers'
import {
  BRANCH_FIELDS,
  CART_FIELDS,
  CATEGORY_FIELDS,
  PRODUCT_DETAIL_FIELDS,
  STORE_ORDER_FIELDS,
} from './fragments'

type Raw = Record<string, unknown>

export { toRecipeItem, toUser }

export const toCategory = (raw: Raw): Category => ({
  id: asString(raw.id),
  name: asString(raw.name),
  active: asBoolean(raw.active),
})

export const toConfigOption = (raw: Raw): ProductOption => ({
  id: asString(raw.id),
  name: asString(raw.name),
  extraPrice: asNumber(raw.extraPrice),
  available: asBoolean(raw.available),
})

export const toConfigGroup = (raw: Raw): ProductConfigGroup => ({
  id: asString(raw.id),
  name: asString(raw.name),
  type: asString(raw.type) === 'MULTIPLE' ? 'multiple' : 'single',
  required: asBoolean(raw.required),
  min: raw.min == null ? null : asNumber(raw.min),
  max: raw.max == null ? null : asNumber(raw.max),
  options: asList(raw.options, toConfigOption),
})

export const toProduct = (raw: Raw): Product => ({
  id: asString(raw.id),
  categoryId: asString(raw.categoryId),
  name: asString(raw.name),
  description: asString(raw.description),
  price: asNumber(raw.price),
  image: raw.image == null ? null : String(raw.image),
  available: asBoolean(raw.available),
  configGroups: asList(raw.configGroups, toConfigGroup),
  recipe: asList(raw.recipe, toRecipeItem),
})

export const toBranchHours = (raw: Raw): BranchHours => ({
  dayOfWeek: asNumber(raw.dayOfWeek),
  opening: raw.opening == null ? null : String(raw.opening),
  closing: raw.closing == null ? null : String(raw.closing),
  closed: asBoolean(raw.closed),
})

export const toBranch = (raw: Raw): Branch => ({
  id: asString(raw.id),
  name: asString(raw.name),
  addressText: asString(raw.addressText),
  latitude: asNumber(raw.latitude),
  longitude: asNumber(raw.longitude),
  phone: raw.phone == null ? null : String(raw.phone),
  active: asBoolean(raw.active),
  hours: asList(raw.hours, toBranchHours),
})

export const toOrderItemOption = (raw: Raw): OrderItemOption => ({
  optionId: asString(raw.optionId),
  name: asString(raw.name),
  extraPrice: asNumber(raw.extraPrice),
})

export const toOrderItem = (raw: Raw): OrderItem => ({
  productId: asString(raw.productId),
  name: asString(raw.name),
  unitPrice: asNumber(raw.unitPrice),
  quantity: asNumber(raw.quantity),
  observations: raw.observations == null ? null : String(raw.observations),
  subtotal: asNumber(raw.subtotal),
  options: asList(raw.options, toOrderItemOption),
})

export const toOrderStatusHistory = (raw: Raw): OrderStatusHistory => ({
  previousStatus: asString(raw.previousStatus) as OrderStatus,
  newStatus: asString(raw.newStatus) as OrderStatus,
  changedAt: asString(raw.changedAt),
})

export const toOrder = (raw: Raw): Order => ({
  id: asString(raw.id),
  number: asString(raw.number),
  clientId: asString(raw.clientId),
  riderId: raw.riderId == null ? null : String(raw.riderId),
  riderLocation:
    raw.riderLocation == null
      ? null
      : {
          latitude: asNumber((raw.riderLocation as Raw).latitude),
          longitude: asNumber((raw.riderLocation as Raw).longitude),
        },
  branchId: asString(raw.branchId),
  branch: raw.branch ? toBranch(raw.branch as Raw) : null,
  client: raw.client ? toUser(raw.client as Raw) : null,
  deliveryAddress: {
    text: asString((raw.deliveryAddress as Raw | undefined)?.text),
    latitude: asNumber((raw.deliveryAddress as Raw | undefined)?.latitude),
    longitude: asNumber((raw.deliveryAddress as Raw | undefined)?.longitude),
  },
  status: asString(raw.status) as OrderStatus,
  total: asNumber(raw.total),
  estimatedDeliveryAt: raw.estimatedDeliveryAt == null ? null : String(raw.estimatedDeliveryAt),
  createdAt: asString(raw.createdAt),
  items: asList(raw.items, toOrderItem),
  statusHistory: asList(raw.statusHistory, toOrderStatusHistory),
  availableTransitions: asList(raw.availableTransitions, (entry) => String(entry)) as OrderStatus[],
})

export const toCartItem = (raw: Raw): CartItem => ({
  id: asString(raw.id),
  productId: asString(raw.productId),
  product: raw.product ? toProduct(raw.product as Raw) : null,
  quantity: asNumber(raw.quantity),
  observations: raw.observations == null ? null : String(raw.observations),
  optionIds: asList(raw.optionIds, (entry) => String(entry)),
  options: asList(raw.options, toConfigOption),
})

export const toCart = (raw: Raw): Cart => ({
  id: asString(raw.id),
  clientId: asString(raw.clientId),
  status: asString(raw.status),
  items: asList(raw.items, toCartItem),
  total: asNumber(raw.total),
})

export const CATEGORIES = gql`
  query Categories {
    categories {
      ${CATEGORY_FIELDS}
    }
  }
`

export const PRODUCTS = gql`
  query Products($filter: ProductFilterInput) {
    products(filter: $filter) {
      ${PRODUCT_DETAIL_FIELDS}
    }
  }
`

export const PRODUCT = gql`
  query Product($id: ID!) {
    product(id: $id) {
      ${PRODUCT_DETAIL_FIELDS}
    }
  }
`

export const MY_ORDERS = gql`
  query MyOrders {
    myOrders {
      ${STORE_ORDER_FIELDS}
    }
  }
`

export const ORDER = gql`
  query Order($id: ID!) {
    order(id: $id) {
      ${STORE_ORDER_FIELDS}
      riderId
      riderLocation {
        latitude
        longitude
      }
    }
  }
`

export const CREATE_ORDER = gql`
  mutation CreateOrder($addressId: ID!) {
    createOrder(addressId: $addressId) {
      ${STORE_ORDER_FIELDS}
    }
  }
`

export const MY_CART = gql`
  query MyCart {
    myCart {
      ${CART_FIELDS}
    }
  }
`

export const ADD_CART_ITEM = gql`
  mutation AddCartItem($input: AddCartItemInput!) {
    addCartItem(input: $input) {
      ${CART_FIELDS}
    }
  }
`

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($itemId: ID!, $input: UpdateCartItemInput!) {
    updateCartItem(itemId: $itemId, input: $input) {
      ${CART_FIELDS}
    }
  }
`

export const REMOVE_CART_ITEM = gql`
  mutation RemoveCartItem($itemId: ID!) {
    removeCartItem(itemId: $itemId) {
      ${CART_FIELDS}
    }
  }
`

export const AVAILABLE_BRANCHES = gql`
  query AvailableBranches($lat: Float!, $lng: Float!) {
    availableBranches(lat: $lat, lng: $lng) {
      ${BRANCH_FIELDS}
    }
  }
`

export const NEARBY_BRANCHES = gql`
  query NearbyBranches($lat: Float!, $lng: Float!) {
    nearbyBranches(lat: $lat, lng: $lng) {
      ${BRANCH_FIELDS}
    }
  }
`
