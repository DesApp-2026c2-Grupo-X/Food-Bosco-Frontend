import type { Branch } from './branch'

export interface ReviewRatingBreakdown {
  rating: number
  count: number
}

export interface ReviewComment {
  rating: number
  comment: string | null
  createdAt: string
}

export interface OrderReview {
  id: string
  orderId: string
  customerId: string
  branchId: string
  branch?: Branch | null
  branchRating: number
  branchComment: string | null
  courierId: string | null
  courierRating: number | null
  courierComment: string | null
  createdAt: string
  updatedAt: string
}

export interface OrderReviewStatus {
  canReview: boolean
  review: OrderReview | null
}

export interface BranchReviewStats {
  branchId: string
  averageRating: number
  totalReviews: number
  distribution: ReviewRatingBreakdown[]
  comments: ReviewComment[]
}

export interface CourierReviewStats {
  courierId: string
  averageRating: number
  totalReviews: number
  distribution: ReviewRatingBreakdown[]
  comments: ReviewComment[]
}

export interface BranchRatingRow {
  branchId: string
  branch?: Branch | null
  averageRating: number
  totalReviews: number
}

export interface CourierRatingProfile {
  id: string
  firstName: string | null
  lastName: string | null
}

export interface CourierRatingRow {
  courierId: string
  rider?: CourierRatingProfile | null
  averageRating: number
  totalReviews: number
}

export interface ReviewsSummary {
  branchAverageRating: number
  branchReviews: number
  courierAverageRating: number
  courierReviews: number
}

export interface CreateOrderReviewInput {
  branchRating: number
  branchComment?: string | null
  courierRating?: number | null
  courierComment?: string | null
}

export const REVIEW_COMMENT_MAX_LENGTH = 500

export const REVIEW_RATING_MESSAGES: Record<number, string> = {
  1: 'Muy malo',
  2: 'Malo',
  3: 'Regular',
  4: 'Muy bueno',
  5: 'Excelente',
}

export const ratingMessage = (rating: number): string => REVIEW_RATING_MESSAGES[rating] ?? ''
