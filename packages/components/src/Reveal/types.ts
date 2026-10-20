import type { BoxProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'

export interface RevealProps extends Omit<BoxProps, 'children'> {
  children: ReactNode
  delayMs?: number
  offsetY?: number
  once?: boolean
}
