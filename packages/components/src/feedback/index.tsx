import { Box, SimpleGrid, Skeleton, Spinner, Text, VisuallyHidden, VStack } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { usePrefersReducedMotion } from '../usePrefersReducedMotion'

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
  variant?: 'spinner' | 'skeleton' | 'list'
  paddingY?: string
  skeletonCount?: number
  skeletonHeight?: string
  label?: string
}

export const LoadingState = ({
  variant = 'spinner',
  paddingY = '24',
  skeletonCount = 8,
  skeletonHeight = '220px',
  label = 'Cargando contenido',
}: LoadingStateProps) => {
  const reducedMotion = usePrefersReducedMotion()
  const skeletonAnimation = reducedMotion ? 'none' : undefined

  if (variant === 'skeleton') {
    return (
      <Box role="status" aria-live="polite" aria-busy="true">
        <VisuallyHidden>{label}</VisuallyHidden>
        <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} gap={{ base: '3', md: '5' }}>
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <Skeleton
              key={index}
              height={skeletonHeight}
              borderRadius="2xl"
              animation={skeletonAnimation}
            />
          ))}
        </SimpleGrid>
      </Box>
    )
  }

  if (variant === 'list') {
    return (
      <VStack role="status" aria-live="polite" aria-busy="true" gap="3" align="stretch">
        <VisuallyHidden>{label}</VisuallyHidden>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Skeleton
            key={index}
            height={skeletonHeight === '220px' ? '96px' : skeletonHeight}
            borderRadius="2xl"
            animation={skeletonAnimation}
          />
        ))}
      </VStack>
    )
  }

  return (
    <VStack role="status" aria-live="polite" aria-busy="true" gap="3" paddingY={paddingY}>
      <Spinner size="lg" color="brand.600" />
      <VisuallyHidden>{label}</VisuallyHidden>
    </VStack>
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
