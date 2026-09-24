import { gql } from '@apollo/client'
import type {
  BranchStock,
  OutOfStockRow,
  Parameter,
  ProductReportRow,
  StaffMember,
} from '@repo/domain'
import { toBranch, toCategory, toOrder, toProduct } from './store'
import {
  ROLE_FROM_API,
  asBoolean,
  asNumber,
  asString,
  toIngredient,
  toOrderState,
  toPromotion,
} from './mappers'
import type { Raw } from './mappers'
import {
  BRANCH_FIELDS,
  BRANCH_HOURS_FIELDS,
  BRANCH_STOCK_FIELDS,
  CATEGORY_FIELDS,
  CONFIG_GROUP_FIELDS,
  CONFIG_OPTION_FIELDS,
  INGREDIENT_FIELDS,
  ORDER_FIELDS,
  ORDER_STATE_FIELDS,
  OUT_OF_STOCK_ROW_FIELDS,
  PARAMETER_FIELDS,
  PROMOTION_FIELDS,
  PRODUCT_DETAIL_FIELDS,
  PRODUCT_LIST_FIELDS,
  PRODUCT_REPORT_ROW_FIELDS,
  USER_FIELDS,
} from './fragments'

export const toParameter = (raw: Raw): Parameter => ({
  key: asString(raw.key),
  value: asNumber(raw.value),
  unit: asString(raw.unit),
})

export const toStaffMember = (raw: Raw): StaffMember => ({
  id: asString(raw.id),
  firstName: asString(raw.firstName),
  lastName: asString(raw.lastName),
  email: asString(raw.email),
  phone: asString(raw.phone),
  role: ROLE_FROM_API[asString(raw.role)] ?? 'customer',
  active: asBoolean(raw.active),
  branchId: raw.branchId == null ? null : String(raw.branchId),
})

export const toBranchStock = (raw: Raw): BranchStock => ({
  ingredientId: asString(raw.ingredientId),
  ingredient: raw.ingredient ? toIngredient(raw.ingredient as Raw) : null,
  branchId: asString(raw.branchId),
  quantity: asNumber(raw.quantity),
})

export const toProductReportRow = (raw: Raw): ProductReportRow => ({
  position: asNumber(raw.position),
  product: toProduct(raw.product as Raw),
  category: raw.category
    ? {
        id: asString((raw.category as Raw).id),
        name: asString((raw.category as Raw).name),
        active: asBoolean((raw.category as Raw).active),
      }
    : undefined,
  quantity: raw.quantity == null ? undefined : asNumber(raw.quantity),
  revenue: raw.revenue == null ? undefined : asNumber(raw.revenue),
})

export const toOutOfStockRow = (raw: Raw): OutOfStockRow => ({
  product: toProduct(raw.product as Raw),
  category: raw.category
    ? {
        id: asString((raw.category as Raw).id),
        name: asString((raw.category as Raw).name),
        active: asBoolean((raw.category as Raw).active),
      }
    : undefined,
  quantity: asNumber(raw.quantity),
})

export const toConfigGroupType = (type: 'single' | 'multiple'): 'SINGLE' | 'MULTIPLE' =>
  type === 'multiple' ? 'MULTIPLE' : 'SINGLE'

// ===== Queries =====

export const ADMIN_CATEGORIES = gql`
  query AdminCategories {
    categories {
      ${CATEGORY_FIELDS}
    }
  }
`

export const ADMIN_PRODUCTS = gql`
  query AdminProducts($filter: ProductFilterInput) {
    products(filter: $filter) {
      ${PRODUCT_LIST_FIELDS}
    }
  }
`

export const ADMIN_PRODUCT = gql`
  query AdminProduct($id: ID!) {
    product(id: $id) {
      ${PRODUCT_DETAIL_FIELDS}
    }
  }
`

export const ADMIN_INGREDIENTS = gql`
  query AdminIngredients {
    ingredients {
      ${INGREDIENT_FIELDS}
    }
  }
`

export const ADMIN_BRANCHES = gql`
  query AdminBranches {
    branches {
      ${BRANCH_FIELDS}
    }
  }
`

export const ADMIN_USERS = gql`
  query AdminUsers {
    users {
      data {
        ${USER_FIELDS}
      }
    }
  }
`

export const ADMIN_PARAMETERS = gql`
  query AdminParameters {
    parameters {
      ${PARAMETER_FIELDS}
    }
  }
`

export const ADMIN_PROMOTIONS = gql`
  query AdminPromotions {
    promotions {
      ${PROMOTION_FIELDS}
    }
  }
`

export const ADMIN_ORDER_STATES = gql`
  query AdminOrderStates {
    orderStates {
      ${ORDER_STATE_FIELDS}
    }
  }
`

export const ADMIN_ORDERS = gql`
  query AdminOrders($filter: OrderFilterInput) {
    orders(filter: $filter) {
      ${ORDER_FIELDS}
    }
  }
`

export const ADMIN_ORDER = gql`
  query AdminOrder($id: ID!) {
    order(id: $id) {
      ${ORDER_FIELDS}
    }
  }
`

export const ADMIN_BRANCH_STOCK = gql`
  query AdminBranchStock($branchId: ID) {
    branchStock(branchId: $branchId) {
      ${BRANCH_STOCK_FIELDS}
    }
  }
`

export const BEST_SELLING_PRODUCTS = gql`
  query BestSellingProducts($branchId: ID) {
    bestSellingProducts(branchId: $branchId) {
      ${PRODUCT_REPORT_ROW_FIELDS}
    }
  }
`

export const LEAST_SOLD_PRODUCTS = gql`
  query LeastSoldProducts($branchId: ID) {
    leastSoldProducts(branchId: $branchId) {
      ${PRODUCT_REPORT_ROW_FIELDS}
    }
  }
`

export const OUT_OF_STOCK_PRODUCTS = gql`
  query OutOfStockProducts($branchId: ID) {
    outOfStockProducts(branchId: $branchId) {
      ${OUT_OF_STOCK_ROW_FIELDS}
    }
  }
`

export const HIGHEST_REVENUE_PRODUCTS = gql`
  query HighestRevenueProducts($branchId: ID) {
    highestRevenueProducts(branchId: $branchId) {
      ${PRODUCT_REPORT_ROW_FIELDS}
    }
  }
`

// ===== Mutations =====

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      ${CATEGORY_FIELDS}
    }
  }
`

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $input: CategoryInput!) {
    updateCategory(id: $id, input: $input) {
      ${CATEGORY_FIELDS}
    }
  }
`

export const SET_CATEGORY_ACTIVE = gql`
  mutation SetCategoryActive($id: ID!, $active: Boolean!) {
    setCategoryActive(id: $id, active: $active) {
      ${CATEGORY_FIELDS}
    }
  }
`

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      ${PRODUCT_DETAIL_FIELDS}
    }
  }
`

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
      ${PRODUCT_DETAIL_FIELDS}
    }
  }
`

export const SET_PRODUCT_AVAILABLE = gql`
  mutation SetProductAvailable($id: ID!, $available: Boolean!) {
    setProductAvailable(id: $id, available: $available) {
      ${PRODUCT_LIST_FIELDS}
    }
  }
`

export const CREATE_CONFIG_GROUP = gql`
  mutation CreateConfigGroup($productId: ID!, $input: ConfigGroupInput!) {
    createConfigGroup(productId: $productId, input: $input) {
      ${CONFIG_GROUP_FIELDS}
    }
  }
`

export const UPDATE_CONFIG_GROUP = gql`
  mutation UpdateConfigGroup($productId: ID!, $groupId: ID!, $input: ConfigGroupInput!) {
    updateConfigGroup(productId: $productId, groupId: $groupId, input: $input) {
      ${CONFIG_GROUP_FIELDS}
    }
  }
`

export const DELETE_CONFIG_GROUP = gql`
  mutation DeleteConfigGroup($productId: ID!, $groupId: ID!) {
    deleteConfigGroup(productId: $productId, groupId: $groupId)
  }
`

export const CREATE_CONFIG_OPTION = gql`
  mutation CreateConfigOption($productId: ID!, $groupId: ID!, $input: ConfigOptionInput!) {
    createConfigOption(productId: $productId, groupId: $groupId, input: $input) {
      ${CONFIG_OPTION_FIELDS}
    }
  }
`

export const UPDATE_CONFIG_OPTION = gql`
  mutation UpdateConfigOption($productId: ID!, $groupId: ID!, $optionId: ID!, $input: ConfigOptionInput!) {
    updateConfigOption(productId: $productId, groupId: $groupId, optionId: $optionId, input: $input) {
      ${CONFIG_OPTION_FIELDS}
    }
  }
`

export const DELETE_CONFIG_OPTION = gql`
  mutation DeleteConfigOption($productId: ID!, $groupId: ID!, $optionId: ID!) {
    deleteConfigOption(productId: $productId, groupId: $groupId, optionId: $optionId)
  }
`

export const ADD_RECIPE_ITEM = gql`
  mutation AddRecipeItem($productId: ID!, $input: RecipeItemInput!) {
    addRecipeItem(productId: $productId, input: $input) {
      ${PRODUCT_DETAIL_FIELDS}
    }
  }
`

export const UPDATE_RECIPE_ITEM = gql`
  mutation UpdateRecipeItem($productId: ID!, $itemId: ID!, $input: RecipeItemInput!) {
    updateRecipeItem(productId: $productId, itemId: $itemId, input: $input) {
      ${PRODUCT_DETAIL_FIELDS}
    }
  }
`

export const REMOVE_RECIPE_ITEM = gql`
  mutation RemoveRecipeItem($productId: ID!, $itemId: ID!) {
    removeRecipeItem(productId: $productId, itemId: $itemId) {
      ${PRODUCT_DETAIL_FIELDS}
    }
  }
`

export const CREATE_INGREDIENT = gql`
  mutation CreateIngredient($input: IngredientInput!) {
    createIngredient(input: $input) {
      ${INGREDIENT_FIELDS}
    }
  }
`

export const UPDATE_INGREDIENT = gql`
  mutation UpdateIngredient($id: ID!, $input: IngredientInput!) {
    updateIngredient(id: $id, input: $input) {
      ${INGREDIENT_FIELDS}
    }
  }
`

export const SET_INGREDIENT_ACTIVE = gql`
  mutation SetIngredientActive($id: ID!, $active: Boolean!) {
    setIngredientActive(id: $id, active: $active) {
      ${INGREDIENT_FIELDS}
    }
  }
`

export const CREATE_BRANCH = gql`
  mutation CreateBranch($input: BranchInput!) {
    createBranch(input: $input) {
      ${BRANCH_FIELDS}
    }
  }
`

export const UPDATE_BRANCH = gql`
  mutation UpdateBranch($id: ID!, $input: BranchInput!) {
    updateBranch(id: $id, input: $input) {
      ${BRANCH_FIELDS}
    }
  }
`

export const SET_BRANCH_ACTIVE = gql`
  mutation SetBranchActive($id: ID!, $active: Boolean!) {
    setBranchActive(id: $id, active: $active) {
      ${BRANCH_FIELDS}
    }
  }
`

export const UPDATE_BRANCH_HOURS = gql`
  mutation UpdateBranchHours($branchId: ID!, $hours: [BranchHoursInput!]!) {
    updateBranchHours(branchId: $branchId, hours: $hours) {
      ${BRANCH_HOURS_FIELDS}
    }
  }
`

export const CREATE_STAFF = gql`
  mutation CreateStaff($input: CreateStaffInput!) {
    createStaff(input: $input) {
      ${USER_FIELDS}
    }
  }
`

export const CREATE_ADMIN = gql`
  mutation CreateAdmin($input: CreateAdminInput!) {
    createAdmin(input: $input) {
      ${USER_FIELDS}
    }
  }
`

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      ${USER_FIELDS}
    }
  }
`

export const SET_USER_ACTIVE = gql`
  mutation SetUserActive($id: ID!, $active: Boolean!) {
    setUserActive(id: $id, active: $active) {
      ${USER_FIELDS}
    }
  }
`

export const UPDATE_PARAMETER = gql`
  mutation UpdateParameter($key: String!, $value: Float!) {
    updateParameter(key: $key, value: $value) {
      ${PARAMETER_FIELDS}
    }
  }
`

export const CREATE_PROMOTION = gql`
  mutation CreatePromotion($input: PromotionInput!) {
    createPromotion(input: $input) {
      ${PROMOTION_FIELDS}
    }
  }
`

export const UPDATE_PROMOTION = gql`
  mutation UpdatePromotion($id: ID!, $input: PromotionInput!) {
    updatePromotion(id: $id, input: $input) {
      ${PROMOTION_FIELDS}
    }
  }
`

export const SET_PROMOTION_ACTIVE = gql`
  mutation SetPromotionActive($id: ID!, $active: Boolean!) {
    setPromotionActive(id: $id, active: $active) {
      ${PROMOTION_FIELDS}
    }
  }
`

export const CREATE_ORDER_STATE = gql`
  mutation CreateOrderState($input: OrderStateInput!) {
    createOrderState(input: $input) {
      ${ORDER_STATE_FIELDS}
    }
  }
`

export const UPDATE_ORDER_STATE = gql`
  mutation UpdateOrderState($code: String!, $input: OrderStateInput!) {
    updateOrderState(code: $code, input: $input) {
      ${ORDER_STATE_FIELDS}
    }
  }
`

export const SET_ORDER_STATE_ACTIVE = gql`
  mutation SetOrderStateActive($code: String!, $active: Boolean!) {
    setOrderStateActive(code: $code, active: $active) {
      ${ORDER_STATE_FIELDS}
    }
  }
`

export const CHANGE_ORDER_STATUS = gql`
  mutation ChangeOrderStatus($orderId: ID!, $status: OrderStatus!) {
    changeOrderStatus(orderId: $orderId, status: $status) {
      ${ORDER_FIELDS}
    }
  }
`

export const RELEASE_ORDER_RIDER = gql`
  mutation ReleaseOrderRider($orderId: ID!) {
    releaseOrderRider(orderId: $orderId) {
      ${ORDER_FIELDS}
    }
  }
`

export const ADJUST_STOCK = gql`
  mutation AdjustStock($input: AdjustStockInput!) {
    adjustStock(input: $input) {
      ${BRANCH_STOCK_FIELDS}
    }
  }
`

export type { Raw }

// Re-export mappers from the shared store layer for admin consumers.
export { toBranch, toCategory, toIngredient, toOrder, toProduct, toOrderState, toPromotion }
