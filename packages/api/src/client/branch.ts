import { gql } from '@apollo/client'
import type { BranchProduct, RecipeItem } from '@repo/domain'
import { toProduct } from './store'
import { asBoolean, toRecipeItem as toSharedRecipeItem } from './mappers'
import { BRANCH_FIELDS, BRANCH_PRODUCT_FIELDS } from './fragments'

type Raw = Record<string, unknown>

export { toIngredient } from './mappers'

export const toRecipeItem = (raw: Raw): RecipeItem => toSharedRecipeItem(raw, true)

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

export const BRANCH = gql`
  query Branch($id: ID!) {
    branch(id: $id) {
      ${BRANCH_FIELDS}
    }
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
