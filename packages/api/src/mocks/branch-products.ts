import type { BranchProduct } from '@repo/domain'
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from './catalog'
import { getProductRecipe } from './recipes'

const PAUSED_PRODUCT_IDS = new Set<string>(['202', '401'])

export const MOCK_BRANCH_PRODUCTS: BranchProduct[] = MOCK_PRODUCTS.map((product) => ({
  product: { ...product, recipe: getProductRecipe(product.id) },
  categoryName:
    MOCK_CATEGORIES.find((category) => category.id === product.categoryId)?.name ?? 'Sin categoría',
  available: !PAUSED_PRODUCT_IDS.has(product.id),
}))
