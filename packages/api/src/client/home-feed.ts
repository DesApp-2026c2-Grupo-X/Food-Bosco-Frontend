import { gql } from '@apollo/client'
import type {
  HomeFeed,
  HomeFeedNearestBranch,
  HomeFeedReorder,
  HomeFeedReorderItem,
  OrderStatus,
  PersonalizedProduct,
  Promotion,
  RecommendationReason,
} from '@repo/domain'
import { asBoolean, asList, asNumber, asString, toPromotion, type Raw } from './mappers'
import { BRANCH_FIELDS, CATEGORY_FIELDS, STORE_PRODUCT_FIELDS } from './fragments'
import { toBranch, toCategory, toProduct } from './store'

export const HOME_FEED = gql`
  query HomeFeed($input: HomeFeedInput) {
    homeFeed(input: $input) {
      generatedAt
      hasHistory
      topCategory {
        ${CATEGORY_FIELDS}
      }
      favoriteBranch {
        ${BRANCH_FIELDS}
      }
      nearestBranch {
        distanceMeters
        branch {
          ${BRANCH_FIELDS}
        }
      }
      categories {
        ${CATEGORY_FIELDS}
      }
      forYou {
        reason
        hint
        score
        product {
          ${STORE_PRODUCT_FIELDS}
        }
      }
      discovery {
        reason
        hint
        score
        product {
          ${STORE_PRODUCT_FIELDS}
        }
      }
      reorder {
        id
        number
        status
        createdAt
        total
        branchId
        branch {
          ${BRANCH_FIELDS}
        }
        items {
          productId
          name
          quantity
        }
      }
      promotions {
        id
        name
        description
        startDate
        endDate
        type
        discountValue
        maxDiscount
        buyQuantity
        payQuantity
        scope
        categoryIds
        productIds
        branchIds
        minSubtotal
        minQuantity
        daysOfWeek
        startTime
        endTime
      }
    }
  }
`

const toRecommendation = (raw: Raw): PersonalizedProduct => ({
  product: toProduct((raw.product as Raw | undefined) ?? {}),
  reason: asString(raw.reason) as RecommendationReason,
  hint: raw.hint == null ? null : String(raw.hint),
  score: asNumber(raw.score),
})

const toNearestBranch = (raw: Raw): HomeFeedNearestBranch => ({
  branch: toBranch((raw.branch as Raw | undefined) ?? {}),
  distanceMeters: asNumber(raw.distanceMeters),
})

const toReorderItem = (raw: Raw): HomeFeedReorderItem => ({
  productId: asString(raw.productId),
  name: asString(raw.name),
  quantity: asNumber(raw.quantity),
})

const toReorder = (raw: Raw): HomeFeedReorder => ({
  id: asString(raw.id),
  number: asString(raw.number),
  status: asString(raw.status) as OrderStatus,
  createdAt: asString(raw.createdAt),
  total: asNumber(raw.total),
  branchId: asString(raw.branchId),
  branch: raw.branch ? toBranch(raw.branch as Raw) : null,
  items: asList(raw.items, toReorderItem),
})

const toHomePromotion = (raw: Raw): Promotion => toPromotion({ ...raw, active: true })

export const toHomeFeed = (raw: Raw): HomeFeed => ({
  generatedAt: asString(raw.generatedAt),
  hasHistory: asBoolean(raw.hasHistory),
  topCategory: raw.topCategory ? toCategory(raw.topCategory as Raw) : null,
  favoriteBranch: raw.favoriteBranch ? toBranch(raw.favoriteBranch as Raw) : null,
  nearestBranch: raw.nearestBranch ? toNearestBranch(raw.nearestBranch as Raw) : null,
  categories: asList(raw.categories, toCategory),
  forYou: asList(raw.forYou, toRecommendation),
  discovery: asList(raw.discovery, toRecommendation),
  reorder: asList(raw.reorder, toReorder),
  promotions: asList(raw.promotions, toHomePromotion),
})
