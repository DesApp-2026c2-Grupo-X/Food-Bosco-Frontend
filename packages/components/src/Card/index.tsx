import { Box } from '@chakra-ui/react'
import { usePrefersReducedMotion } from '../usePrefersReducedMotion'
import type { CardProps } from './types'

export const Card = ({ variant = 'panel', interactive, ...props }: CardProps) => {
  const reducedMotion = usePrefersReducedMotion()

  return (
    <Box
      bg={variant === 'subtle' ? 'bg.subtle' : 'bg.panel'}
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="2xl"
      padding="5"
      {...(interactive
        ? {
            cursor: 'pointer',
            transitionProperty: reducedMotion ? undefined : 'transform, box-shadow, border-color',
            transitionDuration: reducedMotion ? undefined : '160ms',
            transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
            _hover: {
              borderColor: 'border.emphasized',
              boxShadow: 'md',
              transform: reducedMotion ? undefined : 'translateY(-2px)',
            },
            _active: { transform: reducedMotion ? undefined : 'translateY(0)' },
            _focusWithin: {
              outline: '2px solid',
              outlineColor: 'brand.500',
              outlineOffset: '2px',
            },
          }
        : {})}
      {...props}
    />
  )
}
