import type { ReactNode } from 'react'
import type { LinkProps } from '@chakra-ui/react'

export interface MenuLinkProps extends Omit<LinkProps, 'href' | 'onClick'> {
  to: string
  children: ReactNode
  onClick?: () => void
}
