import { useMemo } from 'react'
import {
  buildTasteProfile,
  getReorderSuggestions,
  haversineDistanceMeters,
  orderCategoriesByTaste,
  orderPromotionsForUser,
  recommendDiscoveryProducts,
  recommendProducts,
  type Address,
  type Branch,
  type Category,
  type Order,
  type PersonalizedProduct,
  type Product,
  type Promotion,
  type TasteProfile,
} from '@repo/domain'
import { getHomeGreeting } from '../utils/homeGreeting'

export interface NearestBranch {
  branch: Branch
  distanceMeters: number
}

export interface FavoriteBranchSummary {
  branchId: string
  name: string | null
  orders: number
}

export interface HomePersonalization {
  profile: TasteProfile
  hasHistory: boolean
  greeting: string
  topCategoryName: string | null
  recommendations: PersonalizedProduct[]
  discovery: PersonalizedProduct[]
  reorderOrders: Order[]
  orderedCategories: Category[]
  orderedPromotions: Promotion[]
  recentViewedProducts: Product[]
  nearestBranch: NearestBranch | null
  favoriteBranch: FavoriteBranchSummary | null
}

interface UseHomePersonalizationInput {
  orders: Order[]
  products: Product[]
  categories: Category[]
  branches: Branch[]
  promotions: Promotion[]
  selectedAddress?: Address
  recentViewedIds: string[]
}

const RECENT_VIEWS_LIMIT = 4

export const useHomePersonalization = ({
  orders,
  products,
  categories,
  branches,
  promotions,
  selectedAddress,
  recentViewedIds,
}: UseHomePersonalizationInput): HomePersonalization =>
  useMemo(() => {
    const profile = buildTasteProfile(orders, products)
    const hasHistory = profile.completedOrders > 0
    const productsById = new Map(products.map((product) => [product.id, product]))

    const recentViewedProducts = recentViewedIds
      .map((id) => productsById.get(id))
      .filter((product): product is Product => Boolean(product?.available))
      .slice(0, RECENT_VIEWS_LIMIT)

    const recentViewedProductIds = recentViewedProducts.map((product) => product.id)
    const recommendations = recommendProducts({
      products,
      profile,
      // Para usuarios nuevos, "Vistos hace poco" ya ocupa esos productos.
      // Para usuarios con historial, la vista reciente puede seguir recomendada.
      excludeProductIds: hasHistory ? [] : recentViewedProductIds,
    })
    const recommendedProductIds = recommendations.map((entry) => entry.product.id)

    const discovery = recommendDiscoveryProducts({
      products,
      profile,
      excludeProductIds: [...recentViewedProductIds, ...recommendedProductIds],
    })

    const topCategoryId = profile.favoriteCategoryIds[0]
    const topCategoryName = topCategoryId
      ? (categories.find((category) => category.id === topCategoryId)?.name ?? null)
      : null

    const favoriteBranchId = profile.favoriteBranchIds[0]
    const favoriteBranchOrders = favoriteBranchId
      ? orders.filter(
          (order) => order.status === 'DELIVERED' && order.branchId === favoriteBranchId,
        )
      : []
    const favoriteBranchName = favoriteBranchId
      ? (favoriteBranchOrders.find((order) => order.branch?.name)?.branch?.name ??
        branches.find((branch) => branch.id === favoriteBranchId)?.name ??
        null)
      : null

    const nearestBranch = selectedAddress
      ? (branches
          .map((branch) => ({
            branch,
            distanceMeters: haversineDistanceMeters(selectedAddress, {
              latitude: branch.latitude,
              longitude: branch.longitude,
            }),
          }))
          .sort((a, b) => a.distanceMeters - b.distanceMeters)[0] ?? null)
      : null

    return {
      profile,
      hasHistory,
      greeting: getHomeGreeting(),
      topCategoryName,
      recommendations,
      discovery,
      reorderOrders: getReorderSuggestions(orders),
      orderedCategories: hasHistory ? orderCategoriesByTaste(categories, profile) : categories,
      orderedPromotions: hasHistory ? orderPromotionsForUser(promotions, profile) : promotions,
      recentViewedProducts,
      nearestBranch,
      favoriteBranch: favoriteBranchId
        ? {
            branchId: favoriteBranchId,
            name: favoriteBranchName,
            orders: favoriteBranchOrders.length,
          }
        : null,
    }
  }, [branches, categories, orders, products, promotions, recentViewedIds, selectedAddress])
