import type { Category, Product } from './catalog'
import type { Order } from './order'
import type { Promotion } from './promotion'

const DAY_MS = 24 * 60 * 60 * 1000
const RECENCY_HALF_LIFE_DAYS = 45
const MAX_PRODUCTS_PER_CATEGORY = 2

export type RecommendationReason = 'REPEAT' | 'FAVORITE_CATEGORY' | 'DISCOVERY' | 'POPULAR'

export interface TasteProfile {
  completedOrders: number
  lastOrderAt: string | null
  favoriteCategoryIds: string[]
  favoriteProductIds: string[]
  favoriteBranchIds: string[]
  categoryScores: Record<string, number>
  productScores: Record<string, number>
  branchScores: Record<string, number>
}

export interface PersonalizedProduct {
  product: Product
  reason: RecommendationReason
  hint: string | null
  score: number
}

interface RecommendProductsInput {
  products: Product[]
  profile: TasteProfile
  limit?: number
  excludeProductIds?: string[]
}

interface RecommendDiscoveryInput extends RecommendProductsInput {
  limit?: number
}

const sortedIds = (scores: Record<string, number>): string[] =>
  Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => id)

const addScore = (scores: Record<string, number>, id: string, value: number) => {
  if (!id || value <= 0) return
  scores[id] = (scores[id] ?? 0) + value
}

export const createEmptyTasteProfile = (): TasteProfile => ({
  completedOrders: 0,
  lastOrderAt: null,
  favoriteCategoryIds: [],
  favoriteProductIds: [],
  favoriteBranchIds: [],
  categoryScores: {},
  productScores: {},
  branchScores: {},
})

/**
 * Construye un perfil de gustos con pedidos entregados.
 * La frecuencia se pondera por recencia: lo reciente pesa más que lo viejo.
 */
export const buildTasteProfile = (
  orders: Order[],
  products: Product[],
  now: Date = new Date(),
): TasteProfile => {
  const profile = createEmptyTasteProfile()
  const productById = new Map(products.map((product) => [product.id, product]))
  const delivered = orders.filter((order) => order.status === 'DELIVERED')

  if (delivered.length === 0) return profile

  profile.completedOrders = delivered.length

  for (const order of delivered) {
    const createdAt = new Date(order.createdAt).getTime()
    const ageInDays = Number.isFinite(createdAt)
      ? Math.max(0, (now.getTime() - createdAt) / DAY_MS)
      : RECENCY_HALF_LIFE_DAYS
    const recencyWeight = 1 / (1 + ageInDays / RECENCY_HALF_LIFE_DAYS)

    if (!profile.lastOrderAt || new Date(order.createdAt) > new Date(profile.lastOrderAt)) {
      profile.lastOrderAt = order.createdAt
    }

    addScore(profile.branchScores, order.branchId, recencyWeight)

    for (const item of order.items) {
      const quantity = Math.max(1, item.quantity)
      const points = quantity * recencyWeight
      addScore(profile.productScores, item.productId, points)

      const product = productById.get(item.productId)
      if (product) addScore(profile.categoryScores, product.categoryId, points)
    }
  }

  profile.favoriteCategoryIds = sortedIds(profile.categoryScores)
  profile.favoriteProductIds = sortedIds(profile.productScores)
  profile.favoriteBranchIds = sortedIds(profile.branchScores)

  return profile
}

const productReason = (product: Product, profile: TasteProfile): RecommendationReason => {
  if ((profile.productScores[product.id] ?? 0) > 0) return 'REPEAT'
  if ((profile.categoryScores[product.categoryId] ?? 0) > 0) return 'FAVORITE_CATEGORY'
  return 'DISCOVERY'
}

const reasonHint = (reason: RecommendationReason): string | null => {
  switch (reason) {
    case 'REPEAT':
      return 'Ya lo pediste'
    case 'FAVORITE_CATEGORY':
      return 'De tu categoría favorita'
    case 'DISCOVERY':
      return 'Para probar algo nuevo'
    default:
      return null
  }
}

const productScore = (product: Product, profile: TasteProfile, catalogueIndex: number): number => {
  const productAffinity = profile.productScores[product.id] ?? 0
  const categoryAffinity = profile.categoryScores[product.categoryId] ?? 0
  const isTopCategory = profile.favoriteCategoryIds.slice(0, 3).includes(product.categoryId)

  return (
    productAffinity * 3 +
    categoryAffinity * 1.5 +
    (productAffinity > 0 ? 2 : 0) +
    (isTopCategory ? 1 : 0) +
    // Desempate estable y mínimo: respeta el orden del catálogo.
    (1 / (catalogueIndex + 1)) * 0.001
  )
}

const takeWithDiversity = (
  candidates: PersonalizedProduct[],
  limit: number,
): PersonalizedProduct[] => {
  const selected: PersonalizedProduct[] = []
  const overflow: PersonalizedProduct[] = []
  const perCategory = new Map<string, number>()

  for (const candidate of candidates) {
    if (selected.length >= limit) break

    const categoryId = candidate.product.categoryId
    const count = perCategory.get(categoryId) ?? 0
    if (count >= MAX_PRODUCTS_PER_CATEGORY) {
      overflow.push(candidate)
      continue
    }

    selected.push(candidate)
    perCategory.set(categoryId, count + 1)
  }

  for (const candidate of overflow) {
    if (selected.length >= limit) break
    selected.push(candidate)
  }

  return selected
}

/**
 * Ranking principal de la home. Para usuarios sin historial devuelve el
 * catálogo en su orden actual (comportamiento previo de "Los más pedidos").
 */
export const recommendProducts = ({
  products,
  profile,
  limit = 8,
  excludeProductIds = [],
}: RecommendProductsInput): PersonalizedProduct[] => {
  const excluded = new Set(excludeProductIds)
  const available = products.filter((product) => product.available && !excluded.has(product.id))

  if (profile.completedOrders === 0) {
    return available.slice(0, limit).map((product, index) => ({
      product,
      reason: 'POPULAR',
      hint: null,
      score: available.length - index,
    }))
  }

  const ranked = available
    .map((product, index) => {
      const reason = productReason(product, profile)
      return {
        product,
        reason,
        hint: reasonHint(reason),
        score: productScore(product, profile, index),
      }
    })
    .sort((a, b) => b.score - a.score)

  return takeWithDiversity(ranked, limit)
}

/**
 * Recomendaciones de exploración: prioriza categorías que el usuario todavía
 * no pidió y excluye productos ya comprados para evitar un loop cerrado.
 */
export const recommendDiscoveryProducts = ({
  products,
  profile,
  limit = 4,
  excludeProductIds = [],
}: RecommendDiscoveryInput): PersonalizedProduct[] => {
  if (profile.completedOrders === 0) return []

  const excluded = new Set(excludeProductIds)
  const purchased = new Set(profile.favoriteProductIds)
  const knownCategories = new Set(profile.favoriteCategoryIds)
  const available = products.filter(
    (product) => product.available && !excluded.has(product.id) && !purchased.has(product.id),
  )

  const unexplored = available.filter((product) => !knownCategories.has(product.categoryId))
  const remaining = available.filter((product) => knownCategories.has(product.categoryId))
  const ranked = [...unexplored, ...remaining].map((product, index) => ({
    product,
    reason: 'DISCOVERY' as const,
    hint: 'Nuevo para vos',
    score: unexplored.includes(product) ? 100 - index : 1 / (index + 1),
  }))

  return takeWithDiversity(ranked, limit)
}

/** Conserva todas las categorías, pero pone primero las de mayor afinidad. */
export const orderCategoriesByTaste = (categories: Category[], profile: TasteProfile): Category[] =>
  categories
    .map((category, index) => ({
      category,
      index,
      score: profile.categoryScores[category.id] ?? 0,
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ category }) => category)

/** Prioriza promociones por afinidad de categoría, producto y sucursal. */
export const orderPromotionsForUser = (
  promotions: Promotion[],
  profile: TasteProfile,
): Promotion[] => {
  if (profile.completedOrders === 0) return promotions

  return promotions
    .map((promotion, index) => {
      const categoryAffinity = promotion.categoryIds.reduce(
        (total, id) => total + (profile.categoryScores[id] ?? 0),
        0,
      )
      const productAffinity = promotion.productIds.reduce(
        (total, id) => total + (profile.productScores[id] ?? 0),
        0,
      )
      const branchAffinity = promotion.branchIds.reduce(
        (total, id) => total + (profile.branchScores[id] ?? 0),
        0,
      )

      return {
        promotion,
        index,
        score:
          categoryAffinity * 2 +
          productAffinity * 3 +
          branchAffinity +
          (promotion.priority ?? 0) * 0.01,
      }
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ promotion }) => promotion)
}

/**
 * Pedidos entregados recientes y distintos entre sí, para "Volvé a pedir".
 * Se deduplica por combinación de productos + sucursal para no mostrar tres
 * tarjetas idénticas si el usuario repite siempre lo mismo.
 */
export const getReorderSuggestions = (orders: Order[], limit = 3): Order[] => {
  const seen = new Set<string>()

  return orders
    .filter((order) => order.status === 'DELIVERED' && order.items.length > 0)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .filter((order) => {
      const signature = `${order.branchId}:${order.items
        .map((item) => item.productId)
        .sort()
        .join('|')}`
      if (seen.has(signature)) return false
      seen.add(signature)
      return true
    })
    .slice(0, limit)
}
