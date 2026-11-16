import { useMutation, useQuery } from '@apollo/client'
import type {
  BranchRatingRow,
  BranchReviewStats,
  CourierRatingRow,
  CourierReviewStats,
  CreateOrderReviewInput,
  OrderReview,
  OrderReviewStatus,
  ReviewsSummary,
} from '@repo/domain'
import {
  BRANCH_RATING_RANKING,
  BRANCH_REVIEW_STATS,
  COURIER_RATING_RANKING,
  COURIER_REVIEW_STATS,
  CREATE_ORDER_REVIEW,
  MY_ORDER_REVIEWS,
  ORDER_REVIEW_STATUS,
  PENDING_ORDER_REVIEWS,
  REVIEWS_SUMMARY,
  toBranchRatingRow,
  toBranchReviewStats,
  toCourierRatingRow,
  toCourierReviewStats,
  toOrderReview,
  toOrderReviewStatus,
  toReviewsSummary,
} from '../client/reviews'
import type { Raw } from '../client/mappers'
import { toOrder } from '../client/store'

export interface ReviewFilter {
  from?: string
  to?: string
  limit?: number
}

const filterVariables = (filter?: ReviewFilter): ReviewFilter | null =>
  filter && Object.keys(filter).length > 0 ? filter : null

export const useMyOrderReviews = () => {
  const { data, loading, error, refetch } = useQuery<{ myOrderReviews: Raw[] }>(MY_ORDER_REVIEWS, {
    fetchPolicy: 'network-only',
  })
  const reviews = (data?.myOrderReviews ?? []).map(toOrderReview)
  const reviewByOrderId = new Map(reviews.map((review) => [review.orderId, review]))

  return {
    reviews,
    reviewByOrderId,
    isLoading: loading,
    error,
    refetch,
  }
}

export const useOrderReviewStatus = (orderId: string | undefined) => {
  const { data, loading, error, refetch } = useQuery<{ orderReviewStatus: Raw }>(
    ORDER_REVIEW_STATUS,
    {
      variables: { orderId },
      skip: !orderId,
      fetchPolicy: 'network-only',
    },
  )

  return {
    status: data?.orderReviewStatus ? toOrderReviewStatus(data.orderReviewStatus) : null,
    isLoading: loading,
    error,
    refetch,
  }
}

export const useCreateOrderReview = () => {
  const [createReview, { loading, error, data }] = useMutation<
    { createOrderReview: Raw },
    { orderId: string; input: CreateOrderReviewInput }
  >(CREATE_ORDER_REVIEW, {
    refetchQueries: [MY_ORDER_REVIEWS, PENDING_ORDER_REVIEWS, 'OrderReviewStatus'],
    awaitRefetchQueries: true,
  })

  return {
    createReview,
    review: data?.createOrderReview ? toOrderReview(data.createOrderReview) : null,
    isLoading: loading,
    error,
  }
}

export const usePendingOrderReviews = () => {
  const { data, loading, error, refetch } = useQuery<{ pendingOrderReviews: Raw[] }>(
    PENDING_ORDER_REVIEWS,
    { fetchPolicy: 'network-only' },
  )

  return {
    orders: (data?.pendingOrderReviews ?? []).map(toOrder),
    isLoading: loading,
    error,
    refetch,
  }
}

export const useBranchReviewStats = (branchId: string | undefined, filter?: ReviewFilter) => {
  const { data, loading, error, refetch } = useQuery<{ branchReviewStats: Raw }>(
    BRANCH_REVIEW_STATS,
    {
      variables: { branchId: branchId ?? null, filter: filterVariables(filter) },
      fetchPolicy: 'network-only',
    },
  )

  return {
    stats: data?.branchReviewStats
      ? (toBranchReviewStats(data.branchReviewStats) as BranchReviewStats)
      : null,
    isLoading: loading,
    error,
    refetch,
  }
}

export const useCourierReviewStats = (courierId: string | undefined, filter?: ReviewFilter) => {
  const { data, loading, error, refetch } = useQuery<{ courierReviewStats: Raw }>(
    COURIER_REVIEW_STATS,
    {
      variables: { courierId: courierId ?? null, filter: filterVariables(filter) },
      fetchPolicy: 'network-only',
    },
  )

  return {
    stats: data?.courierReviewStats
      ? (toCourierReviewStats(data.courierReviewStats) as CourierReviewStats)
      : null,
    isLoading: loading,
    error,
    refetch,
  }
}

export const useBranchRatingRanking = (filter?: ReviewFilter) => {
  const { data, loading, error, refetch } = useQuery<{ branchRatingRanking: Raw[] }>(
    BRANCH_RATING_RANKING,
    {
      variables: { filter: filterVariables(filter) },
      fetchPolicy: 'network-only',
    },
  )

  return {
    rows: (data?.branchRatingRanking ?? []).map(
      (row) => toBranchRatingRow(row) as BranchRatingRow,
    ),
    isLoading: loading,
    error,
    refetch,
  }
}

export const useCourierRatingRanking = (filter?: ReviewFilter) => {
  const { data, loading, error, refetch } = useQuery<{ courierRatingRanking: Raw[] }>(
    COURIER_RATING_RANKING,
    {
      variables: { filter: filterVariables(filter) },
      fetchPolicy: 'network-only',
    },
  )

  return {
    rows: (data?.courierRatingRanking ?? []).map(
      (row) => toCourierRatingRow(row) as CourierRatingRow,
    ),
    isLoading: loading,
    error,
    refetch,
  }
}

export const useReviewsSummary = (filter?: ReviewFilter) => {
  const { data, loading, error, refetch } = useQuery<{ reviewsSummary: Raw }>(REVIEWS_SUMMARY, {
    variables: { filter: filterVariables(filter) },
    fetchPolicy: 'network-only',
  })

  return {
    summary: data?.reviewsSummary ? (toReviewsSummary(data.reviewsSummary) as ReviewsSummary) : null,
    isLoading: loading,
    error,
    refetch,
  }
}

export type { OrderReview, OrderReviewStatus }
