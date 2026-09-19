import type { BoxProps } from '@chakra-ui/react'

export interface CardProps extends Omit<BoxProps, 'variant'> {
  variant?: 'panel' | 'subtle'
  interactive?: boolean
}
