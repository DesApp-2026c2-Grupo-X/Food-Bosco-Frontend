import { Box, HStack, VStack } from '@chakra-ui/react'
import StarFill from '@gravity-ui/icons/StarFill'
import { formatOrderDate } from '@repo/domain'
import { Card } from '../Card'
import { EmptyState, LoadingState } from '../feedback'
import { StarRating } from '../StarRating'
import { Muted, Strong } from '../typography'
import type { ReviewStatsPanelProps } from './types'

const formatAverage = (value: number): string => value.toFixed(1)

export const ReviewStatsPanel = ({
  stats,
  isLoading = false,
  title = 'Calificaciones',
  description,
  emptyDescription = 'Cuando tus clientes califiquen sus pedidos, vas a ver las opiniones acá.',
}: ReviewStatsPanelProps) => {
  if (isLoading) {
    return <LoadingState variant="list" skeletonCount={3} skeletonHeight="88px" />
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <EmptyState
        icon={<StarFill width={40} height={40} />}
        title="Todavía no hay calificaciones"
        description={emptyDescription}
      />
    )
  }

  return (
    <VStack align="stretch" gap="4">
      <Card>
        <HStack justify="space-between" align="start" gap="4" wrap="wrap">
          <VStack align="start" gap="1">
            <Muted fontSize="sm">{title}</Muted>
            <HStack gap="2" align="center">
              <Strong fontSize="3xl">{formatAverage(stats.averageRating)}</Strong>
              <StarRating
                value={Math.round(stats.averageRating)}
                readOnly
                size="sm"
                label="Promedio de calificaciones"
              />
            </HStack>
            <Muted fontSize="sm">
              {stats.totalReviews} {stats.totalReviews === 1 ? 'opinión' : 'opiniones'}
              {description ? ` · ${description}` : ''}
            </Muted>
          </VStack>

          <VStack align="stretch" gap="1.5" minWidth={{ base: 'full', sm: '240px' }}>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.distribution.find((entry) => entry.rating === rating)?.count ?? 0
              const percent = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0

              return (
                <HStack key={rating} gap="2">
                  <Muted fontSize="xs" width="10px">
                    {rating}
                  </Muted>
                  <StarFill width={14} height={14} color="var(--chakra-colors-accent-400)" />
                  <Box
                    flex="1"
                    height="2"
                    borderRadius="full"
                    bg="bg.muted"
                    overflow="hidden"
                    aria-hidden="true"
                  >
                    <Box height="full" width={`${percent}%`} bg="accent.400" borderRadius="full" />
                  </Box>
                  <Muted fontSize="xs" minWidth="22px" textAlign="end">
                    {count}
                  </Muted>
                </HStack>
              )
            })}
          </VStack>
        </HStack>
      </Card>

      <VStack align="stretch" gap="3">
        <Strong fontSize="lg">Comentarios</Strong>
        {stats.comments.length === 0 ? (
          <Muted fontSize="sm">Todavía no hay comentarios escritos.</Muted>
        ) : (
          stats.comments.map((comment, index) => (
            <Card key={`${comment.createdAt}-${index}`} variant="subtle">
              <HStack justify="space-between" align="start" gap="3" wrap="wrap">
                <StarRating
                  value={comment.rating}
                  readOnly
                  size="sm"
                  label="Calificación del comentario"
                />
                <Muted fontSize="xs">{formatOrderDate(comment.createdAt)}</Muted>
              </HStack>
              {comment.comment ? (
                <Muted fontSize="sm" marginTop="2">
                  {comment.comment}
                </Muted>
              ) : null}
            </Card>
          ))
        )}
      </VStack>
    </VStack>
  )
}
