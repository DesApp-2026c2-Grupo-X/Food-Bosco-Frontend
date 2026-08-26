import type { LinkProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'

export interface TextLinkProps {
  to: string
  children: ReactNode
  fontSize?: LinkProps['fontSize']
}
