import { Box } from '@chakra-ui/react'
import type { CardProps } from './types'

export const Card = ({ variant = 'panel', interactive, ...props }: CardProps) => (
  <Box
    bg={variant === 'subtle' ? 'bg.subtle' : 'bg.panel'}
    border="1px solid"
    borderColor="border.subtle"
    borderRadius="2xl"
    padding="5"
    {...(interactive ? { _hover: { borderColor: 'border.emphasized' } } : {})}
    {...props}
  />
)
