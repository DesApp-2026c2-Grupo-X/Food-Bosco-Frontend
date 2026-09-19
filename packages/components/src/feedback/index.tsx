import { Box, SimpleGrid, Skeleton, Spinner, Text, VStack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <VStack align="center" gap="2" paddingY="16" textAlign="center">
    {icon ? <Box color="brand.500">{icon}</Box> : null}
    <Text fontWeight="semibold" fontSize="lg">
      {title}
    </Text>
    <Text color="fg.muted" maxWidth="sm">
      {description}
    </Text>
    {action ? <Box marginTop="2">{action}</Box> : null}
  </VStack>
)

export interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton'
  paddingY?: string
  skeletonCount?: number
  skeletonHeight?: string
}

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

export interface ActiveStatusTextProps {
  active: boolean
  feminine?: boolean
}

export const ActiveStatusText = ({ active, feminine }: ActiveStatusTextProps) => (
  <Text color="fg.muted" fontSize="sm">
    {active ? (feminine ? 'Activa' : 'Activo') : feminine ? 'Inactiva' : 'Inactivo'}
  </Text>
)
