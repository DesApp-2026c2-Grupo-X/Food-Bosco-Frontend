import type {
  AppliedPromotion,
  Ingredient,
  Promotion,
  PromotionScope,
  PromotionType,
  RecipeItem,
  User,
  UserRole,
} from '@repo/domain'

export type Raw = Record<string, unknown>

export const asString = (value: unknown, fallback = ''): string =>
  value == null ? fallback : String(value)

export const asNumber = (value: unknown): number => (value == null ? 0 : Number(value))

export const asBoolean = (value: unknown): boolean => Boolean(value)

export const asList = <T>(value: unknown, map: (raw: Raw) => T): T[] =>
  Array.isArray(value) ? value.map((entry) => map(entry as Raw)) : []

export const ROLE_FROM_API: Record<string, UserRole> = {
  CUSTOMER: 'customer',
  BRANCH_ADMIN: 'branch_admin',
  SUPER_ADMIN: 'super_admin',
  RIDER: 'rider',
}

export const toIngredient = (raw: Raw): Ingredient => ({
  id: asString(raw.id),
  name: asString(raw.name),
  unit: asString(raw.unit),
  ...(raw.minQuantity != null ? { minQuantity: asNumber(raw.minQuantity) } : {}),
  active: asBoolean(raw.active),
})

export const toRecipeItem = (raw: Raw, withIngredient = false): RecipeItem => {
  if (withIngredient) {
    return {
      id: asString(raw.id),
      ingredientId: asString(raw.ingredientId),
      quantity: asNumber(raw.quantity),
      ingredient: raw.ingredient ? toIngredient(raw.ingredient as Raw) : null,
    }
  }

  return {
    id: asString(raw.id),
    ingredientId: asString(raw.ingredientId),
    quantity: asNumber(raw.quantity),
  }
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
  createdAt: asString(raw.createdAt, new Date().toISOString()),
})

export const toAppliedPromotion = (raw: Raw): AppliedPromotion => ({
  promotionId: asString(raw.promotionId),
  name: asString(raw.name),
  code: raw.code != null ? asString(raw.code) : null,
  amount: asNumber(raw.amount),
})

export const toPromotion = (raw: Raw): Promotion => ({
  id: asString(raw.id),
  name: asString(raw.name),
  description: raw.description != null ? asString(raw.description) : null,
  startDate: asString(raw.startDate),
  endDate: asString(raw.endDate),
  active: asBoolean(raw.active),
  type: (raw.type as PromotionType) ?? null,
  discountValue: raw.discountValue != null ? asNumber(raw.discountValue) : null,
  maxDiscount: raw.maxDiscount != null ? asNumber(raw.maxDiscount) : null,
  buyQuantity: raw.buyQuantity != null ? asNumber(raw.buyQuantity) : null,
  payQuantity: raw.payQuantity != null ? asNumber(raw.payQuantity) : null,
  scope: (raw.scope as PromotionScope) ?? null,
  categoryIds: Array.isArray(raw.categoryIds) ? raw.categoryIds.map((c) => asString(c)) : [],
  productIds: Array.isArray(raw.productIds) ? raw.productIds.map((p) => asString(p)) : [],
  branchIds: Array.isArray(raw.branchIds) ? raw.branchIds.map((b) => asString(b)) : [],
  minSubtotal: asNumber(raw.minSubtotal),
  minQuantity: asNumber(raw.minQuantity),
  daysOfWeek: Array.isArray(raw.daysOfWeek) ? raw.daysOfWeek.map((d) => asNumber(d)) : [],
  startTime: raw.startTime != null ? asString(raw.startTime) : null,
  endTime: raw.endTime != null ? asString(raw.endTime) : null,
  code: raw.code != null ? asString(raw.code) : null,
  stackable: asBoolean(raw.stackable),
  priority: asNumber(raw.priority),
  maxUsesTotal: raw.maxUsesTotal != null ? asNumber(raw.maxUsesTotal) : null,
  maxUsesPerCustomer: raw.maxUsesPerCustomer != null ? asNumber(raw.maxUsesPerCustomer) : null,
  usedCount: asNumber(raw.usedCount),
})
