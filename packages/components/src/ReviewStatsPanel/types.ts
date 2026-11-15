import type { ReviewComment, ReviewRatingBreakdown } from '@repo/domain'

export interface ReviewStatsData {
  averageRating: number
  totalReviews: number
  distribution: ReviewRatingBreakdown[]
  comments: ReviewComment[]
}

export interface ReviewStatsPanelProps {
  stats: ReviewStatsData | null
  isLoading?: boolean
  title?: string
  description?: string
  emptyDescription?: string
}
