import { Box, SimpleGrid, Skeleton, Spinner } from '@chakra-ui/react'
import type { LoadingStateProps } from './types'

export const LoadingState = ({
  variant = 'spinner',
  paddingY = '24',
  skeletonCount = 8,
  skeletonHeight = '220px',
}: LoadingStateProps) => {
  if (variant === 'skeleton') {
    return (
      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} gap={{ base: '3', md: '5' }}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Skeleton key={index} height={skeletonHeight} borderRadius="2xl" />
        ))}
      </SimpleGrid>
    )
  }

  return (
    <Box paddingY={paddingY} display="flex" justifyContent="center">
      <Spinner size="lg" color="brand.600" />
    </Box>
  )
}
