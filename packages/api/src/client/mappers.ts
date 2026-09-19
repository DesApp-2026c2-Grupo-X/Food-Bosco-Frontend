import type { Ingredient, RecipeItem, User, UserRole } from '@repo/domain'

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
  createdAt: new Date().toISOString(),
})
