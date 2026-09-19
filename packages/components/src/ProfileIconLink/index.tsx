import { Link as ChakraLink } from '@chakra-ui/react'
import Person from '@gravity-ui/icons/Person'
import { NavLink } from 'react-router-dom'
import type { ProfileIconLinkProps } from './types'

export const ProfileIconLink = ({ to, className }: ProfileIconLinkProps) => (
  <ChakraLink
    asChild
    className={className}
    aria-label="Perfil"
    padding="2"
    borderRadius="full"
    color="fg.muted"
    _hover={{ color: 'fg', bg: 'bg.muted' }}
  >
    <NavLink to={to}>
      <Person width={20} height={20} />
    </NavLink>
  </ChakraLink>
)
