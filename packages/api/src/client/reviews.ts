import { gql } from '@apollo/client'
import type {
  BranchRatingRow,
  BranchReviewStats,
  CourierRatingRow,
  CourierReviewStats,
  OrderReview,
  OrderReviewStatus,
  ReviewComment,
  ReviewRatingBreakdown,
  ReviewsSummary,
} from '@repo/domain'
import { BRANCH_FIELDS, STORE_ORDER_FIELDS } from './fragments'
import { asList, asNumber, asString } from './mappers'
import type { Raw } from './mappers'
import { toBranch } from './store'

export const REVIEW_BREAKDOWN_FIELDS = `
  rating
  count
`

export const REVIEW_COMMENT_FIELDS = `
  rating
  comment
  createdAt
`

export const ORDER_REVIEW_FIELDS = `
  id
  orderId
  customerId
  branchId
  branch {
    ${BRANCH_FIELDS}
  }
  branchRating
  branchComment
  courierId
  courierRating
  courierComment
  createdAt
  updatedAt
`

export const BRANCH_REVIEW_STATS_FIELDS = `
  branchId
  averageRating
  totalReviews
  distribution {
    ${REVIEW_BREAKDOWN_FIELDS}
  }
  comments {
    ${REVIEW_COMMENT_FIELDS}
  }
`

export const COURIER_REVIEW_STATS_FIELDS = `
  courierId
  averageRating
  totalReviews
  distribution {
    ${REVIEW_BREAKDOWN_FIELDS}
  }
  comments {
    ${REVIEW_COMMENT_FIELDS}
  }
`

export const REVIEWS_SUMMARY_FIELDS = `
  branchAverageRating
  branchReviews
  courierAverageRating
  courierReviews
`

export const toReviewBreakdown = (raw: Raw): ReviewRatingBreakdown => ({
  rating: asNumber(raw.rating),
  count: asNumber(raw.count),
})

export const toReviewComment = (raw: Raw): ReviewComment => ({
  rating: asNumber(raw.rating),
  comment: raw.comment == null ? null : String(raw.comment),
  createdAt: asString(raw.createdAt),
})

export const toOrderReview = (raw: Raw): OrderReview => ({
  id: asString(raw.id),
  orderId: asString(raw.orderId),
  customerId: asString(raw.customerId),
  branchId: asString(raw.branchId),
  branch: raw.branch ? toBranch(raw.branch as Raw) : null,
  branchRating: asNumber(raw.branchRating),
  branchComment: raw.branchComment == null ? null : String(raw.branchComment),
  courierId: raw.courierId == null ? null : String(raw.courierId),
  courierRating: raw.courierRating == null ? null : asNumber(raw.courierRating),
  courierComment: raw.courierComment == null ? null : String(raw.courierComment),
  createdAt: asString(raw.createdAt),
  updatedAt: asString(raw.updatedAt),
})

export const toOrderReviewStatus = (raw: Raw): OrderReviewStatus => ({
  canReview: Boolean(raw.canReview),
  review: raw.review ? toOrderReview(raw.review as Raw) : null,
})

export const toBranchReviewStats = (raw: Raw): BranchReviewStats => ({
  branchId: asString(raw.branchId),
  averageRating: asNumber(raw.averageRating),
  totalReviews: asNumber(raw.totalReviews),
  distribution: asList(raw.distribution, toReviewBreakdown),
  comments: asList(raw.comments, toReviewComment),
})

export const toCourierReviewStats = (raw: Raw): CourierReviewStats => ({
  courierId: asString(raw.courierId),
  averageRating: asNumber(raw.averageRating),
  totalReviews: asNumber(raw.totalReviews),
  distribution: asList(raw.distribution, toReviewBreakdown),
  comments: asList(raw.comments, toReviewComment),
})

export const toBranchRatingRow = (raw: Raw): BranchRatingRow => ({
  branchId: asString(raw.branchId),
  branch: raw.branch ? toBranch(raw.branch as Raw) : null,
  averageRating: asNumber(raw.averageRating),
  totalReviews: asNumber(raw.totalReviews),
})

export const toCourierRatingRow = (raw: Raw): CourierRatingRow => {
  const rider = raw.rider as Raw | undefined

  return {
    courierId: asString(raw.courierId),
    rider: rider
      ? {
          id: asString(rider.id),
          firstName: rider.firstName == null ? null : String(rider.firstName),
          lastName: rider.lastName == null ? null : String(rider.lastName),
        }
      : null,
    averageRating: asNumber(raw.averageRating),
    totalReviews: asNumber(raw.totalReviews),
  }
}

export const toReviewsSummary = (raw: Raw): ReviewsSummary => ({
  branchAverageRating: asNumber(raw.branchAverageRating),
  branchReviews: asNumber(raw.branchReviews),
  courierAverageRating: asNumber(raw.courierAverageRating),
  courierReviews: asNumber(raw.courierReviews),
})

export const MY_ORDER_REVIEWS = gql`
  query MyOrderReviews {
    myOrderReviews {
      ${ORDER_REVIEW_FIELDS}
    }
  }
`

export const PENDING_ORDER_REVIEWS = gql`
  query PendingOrderReviews {
    pendingOrderReviews {
      ${STORE_ORDER_FIELDS}
    }
  }
`

export const ORDER_REVIEW_STATUS = gql`
  query OrderReviewStatus($orderId: ID!) {
    orderReviewStatus(orderId: $orderId) {
      canReview
      review {
        ${ORDER_REVIEW_FIELDS}
      }
    }
  }
`

export const CREATE_ORDER_REVIEW = gql`
  mutation CreateOrderReview($orderId: ID!, $input: CreateOrderReviewInput!) {
    createOrderReview(orderId: $orderId, input: $input) {
      ${ORDER_REVIEW_FIELDS}
    }
  }
`

export const BRANCH_REVIEW_STATS = gql`
  query BranchReviewStats($branchId: ID, $filter: ReviewFilterInput) {
    branchReviewStats(branchId: $branchId, filter: $filter) {
      ${BRANCH_REVIEW_STATS_FIELDS}
    }
  }
`

export const COURIER_REVIEW_STATS = gql`
  query CourierReviewStats($courierId: ID, $filter: ReviewFilterInput) {
    courierReviewStats(courierId: $courierId, filter: $filter) {
      ${COURIER_REVIEW_STATS_FIELDS}
    }
  }
`

export const BRANCH_RATING_RANKING = gql`
  query BranchRatingRanking($filter: ReviewFilterInput) {
    branchRatingRanking(filter: $filter) {
      branchId
      branch {
        ${BRANCH_FIELDS}
      }
      averageRating
      totalReviews
    }
  }
`

export const COURIER_RATING_RANKING = gql`
  query CourierRatingRanking($filter: ReviewFilterInput) {
    courierRatingRanking(filter: $filter) {
      courierId
      rider {
        id
        firstName
        lastName
      }
      averageRating
      totalReviews
    }
  }
`

export const REVIEWS_SUMMARY = gql`
  query ReviewsSummary($filter: ReviewFilterInput) {
    reviewsSummary(filter: $filter) {
      ${REVIEWS_SUMMARY_FIELDS}
    }
  }
`
