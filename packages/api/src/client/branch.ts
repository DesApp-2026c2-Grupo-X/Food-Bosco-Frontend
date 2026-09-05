import { gql } from '@apollo/client'
import type { BranchProduct, Ingredient, RecipeItem } from '@repo/domain'
import { toProduct } from './store'

type Raw = Record<string, unknown>

const asString = (value: unknown, fallback = ''): string =>
  value == null ? fallback : String(value)

const asNumber = (value: unknown): number => (value == null ? 0 : Number(value))

const asBoolean = (value: unknown): boolean => Boolean(value)

export const toIngredient = (raw: Raw): Ingredient => ({
  id: asString(raw.id),
  name: asString(raw.name),
  unit: asString(raw.unit),
  active: asBoolean(raw.active),
})

export const toRecipeItem = (raw: Raw): RecipeItem => ({
  id: asString(raw.id),
  ingredientId: asString(raw.ingredientId),
  quantity: asNumber(raw.quantity),
  ingredient: raw.ingredient ? toIngredient(raw.ingredient as Raw) : null,
})

export const toBranchProduct = (raw: Raw): BranchProduct => {
  const product = toProduct(raw)
  const category = raw.category as Raw | undefined

  return {
    product: {
      ...product,
      recipe: Array.isArray(raw.recipe)
        ? raw.recipe.map((entry) => toRecipeItem(entry as Raw))
        : product.recipe,
    },
    categoryName: category?.name != null ? String(category.name) : 'Sin categoría',
    available: asBoolean(raw.available),
  }
}

const CATEGORY_FIELDS = `
  id
  name
  active
`

const INGREDIENT_FIELDS = `
  id
  name
  unit
  active
`

const RECIPE_ITEM_FIELDS = `
  id
  ingredientId
  quantity
  ingredient {
    ${INGREDIENT_FIELDS}
  }
`

const BRANCH_PRODUCT_FIELDS = `
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
    ${RECIPE_ITEM_FIELDS}
  }
`

export const BRANCH_PRODUCTS = gql`
  query BranchProducts($branchId: ID!) {
    branchProducts(branchId: $branchId) {
      ${BRANCH_PRODUCT_FIELDS}
    }
  }
`

export const SET_BRANCH_PRODUCT_AVAILABILITY = gql`
  mutation SetBranchProductAvailability($branchId: ID!, $productId: ID!, $available: Boolean!) {
    setBranchProductAvailability(branchId: $branchId, productId: $productId, available: $available)
  }
`

export type { Raw }
