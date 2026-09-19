export const CATEGORY_FIELDS = `
  id
  name
  active
`

export const CONFIG_OPTION_FIELDS = `
  id
  name
  extraPrice
  available
`

export const CONFIG_GROUP_FIELDS = `
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

export const RECIPE_ITEM_FIELDS = `
  id
  ingredientId
  quantity
`

export const PRODUCT_DETAIL_FIELDS = `
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

export const PRODUCT_LIST_FIELDS = `
  id
  categoryId
  name
  description
  price
  image
  available
  category {
    ${CATEGORY_FIELDS}
  }
`

export const INGREDIENT_FIELDS = `
  id
  name
  unit
  active
`

export const BRANCH_HOURS_FIELDS = `
  dayOfWeek
  opening
  closing
  closed
`

export const BRANCH_FIELDS = `
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

export const USER_FIELDS = `
  id
  email
  firstName
  lastName
  phone
  role
  active
  branchId
`

export const ORDER_ITEM_FIELDS = `
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

export const ORDER_FIELDS = `
  id
  number
  clientId
  branchId
  branch {
    ${BRANCH_FIELDS}
  }
  client {
    ${USER_FIELDS}
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

export const STORE_ORDER_FIELDS = `
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

export const PARAMETER_FIELDS = `
  key
  value
  unit
`

export const BRANCH_STOCK_FIELDS = `
  ingredientId
  ingredient {
    ${INGREDIENT_FIELDS}
  }
  branchId
  quantity
`

export const PRODUCT_REPORT_ROW_FIELDS = `
  position
  product {
    id
    name
  }
  category {
    ${CATEGORY_FIELDS}
  }
  quantity
  revenue
`

export const OUT_OF_STOCK_ROW_FIELDS = `
  product {
    id
    name
  }
  category {
    ${CATEGORY_FIELDS}
  }
  quantity
`

export const BRANCH_RECIPE_ITEM_FIELDS = `
  id
  ingredientId
  quantity
  ingredient {
    ${INGREDIENT_FIELDS}
  }
`

export const BRANCH_PRODUCT_FIELDS = `
  id
  categoryId
  name
  description
  price
  image
  available
  category {
    ${CATEGORY_FIELDS}
  }
  recipe {
    ${BRANCH_RECIPE_ITEM_FIELDS}
  }
`

export const CART_ITEM_FIELDS = `
  id
  productId
  product {
    ${PRODUCT_DETAIL_FIELDS}
  }
  quantity
  observations
  optionIds
  options {
    ${CONFIG_OPTION_FIELDS}
  }
`

export const CART_FIELDS = `
  id
  clientId
  status
  total
  items {
    ${CART_ITEM_FIELDS}
  }
`
