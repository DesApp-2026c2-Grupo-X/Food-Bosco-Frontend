import { Link as ChakraLink } from '@chakra-ui/react'
import { NavLink } from 'react-router-dom'
import type { MenuLinkProps } from './types'

export const MenuLink = ({ to, children, onClick, _hover, ...rest }: MenuLinkProps) => (
  <ChakraLink
    asChild
    textDecoration="none"
    _hover={{ textDecoration: 'none', ..._hover }}
    {...rest}
  >
    <NavLink to={to} onClick={onClick}>
      {children}
    </NavLink>
  </ChakraLink>
)
