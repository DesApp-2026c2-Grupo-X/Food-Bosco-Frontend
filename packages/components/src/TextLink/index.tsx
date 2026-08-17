import { Link as ChakraLink } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import type { TextLinkProps } from './types'

export const TextLink = ({ to, children, fontSize }: TextLinkProps) => (
  <ChakraLink asChild color="brand.600" fontWeight="semibold" fontSize={fontSize}>
    <Link to={to}>{children}</Link>
  </ChakraLink>
)
