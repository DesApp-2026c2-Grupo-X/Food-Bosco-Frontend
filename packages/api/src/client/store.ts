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
  RecipeItem,
  User,
  UserRole,
} from '@repo/domain'

type Raw = Record<string, unknown>

const asString = (value: unknown, fallback = ''): string =>
  value == null ? fallback : String(value)

const asNumber = (value: unknown): number => (value == null ? 0 : Number(value))

const asBoolean = (value: unknown): boolean => Boolean(value)

const asList = <T>(value: unknown, map: (raw: Raw) => T): T[] =>
  Array.isArray(value) ? value.map((entry) => map(entry as Raw)) : []

const ROLE_FROM_API: Record<string, UserRole> = {
  CUSTOMER: 'customer',
  BRANCH_ADMIN: 'branch_admin',
  SUPER_ADMIN: 'super_admin',
  RIDER: 'rider',
}

export const toUser = (raw: Raw): User => ({
  id: asString(raw.id),
  email: asString(raw.email),
  role: ROLE_FROM_API[asString(raw.role)] ?? 'customer',
  firstName: asString(raw.firstName),
  lastName: asString(raw.lastName),
  phone: asString(raw.phone),
  active: asBoolean(raw.active),
  branchId: raw.branchId == null ? undefined : String(raw.branchId),
  createdAt: new Date().toISOString(),
})

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

export const toRecipeItem = (raw: Raw): RecipeItem => ({
  id: asString(raw.id),
  ingredientId: asString(raw.ingredientId),
  quantity: asNumber(raw.quantity),
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

const CATEGORY_FIELDS = `
  id
  name
  active
`

const CONFIG_OPTION_FIELDS = `
  id
  name
  extraPrice
  available
`

const CONFIG_GROUP_FIELDS = `
  id
  name
  type
  required
  min
  max
  options {
    ${CONFIG_OPTION_FIELDS}
  }
`

const RECIPE_ITEM_FIELDS = `
  id
  ingredientId
  quantity
`

const PRODUCT_FIELDS = `
  id
  categoryId
  name
  description
  price
  image
  available
  configGroups {
    ${CONFIG_GROUP_FIELDS}
  }
  recipe {
    ${RECIPE_ITEM_FIELDS}
  }
`

const BRANCH_HOURS_FIELDS = `
  dayOfWeek
  opening
  closing
  closed
`

const BRANCH_FIELDS = `
  id
  name
  addressText
  latitude
  longitude
  phone
  active
  hours {
    ${BRANCH_HOURS_FIELDS}
  }
`

const ORDER_ITEM_FIELDS = `
  productId
  name
  unitPrice
  quantity
  observations
  subtotal
  options {
    optionId
    name
    extraPrice
  }
`

const ORDER_FIELDS = `
  id
  number
  clientId
  branchId
  branch {
    ${BRANCH_FIELDS}
  }
  client {
    id
    email
    firstName
    lastName
    phone
    role
    active
  }
  deliveryAddress {
    text
    latitude
    longitude
  }
  status
  total
  estimatedDeliveryAt
  createdAt
  items {
    ${ORDER_ITEM_FIELDS}
  }
  statusHistory {
    previousStatus
    newStatus
    changedAt
  }
  availableTransitions
`

const CART_ITEM_FIELDS = `
  id
  productId
  product {
    ${PRODUCT_FIELDS}
  }
  quantity
  observations
  optionIds
  options {
    ${CONFIG_OPTION_FIELDS}
  }
`

const CART_FIELDS = `
  id
  clientId
  status
  total
  items {
    ${CART_ITEM_FIELDS}
  }
`

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
      ${PRODUCT_FIELDS}
    }
  }
`

export const PRODUCT = gql`
  query Product($id: ID!) {
    product(id: $id) {
      ${PRODUCT_FIELDS}
    }
  }
`

export const MY_ORDERS = gql`
  query MyOrders {
    myOrders {
      ${ORDER_FIELDS}
    }
  }
`

export const ORDER = gql`
  query Order($id: ID!) {
    order(id: $id) {
      ${ORDER_FIELDS}
    }
  }
`

export const CREATE_ORDER = gql`
  mutation CreateOrder($addressId: ID!) {
    createOrder(addressId: $addressId) {
      ${ORDER_FIELDS}
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
