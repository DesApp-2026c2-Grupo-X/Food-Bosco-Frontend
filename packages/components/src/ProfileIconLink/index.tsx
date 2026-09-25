import { IconButton } from '@chakra-ui/react'
import Person from '@gravity-ui/icons/Person'
import { NavLink } from 'react-router-dom'
import type { ProfileIconLinkProps } from './types'

export const ProfileIconLink = ({ to, className }: ProfileIconLinkProps) => (
  <IconButton asChild variant="ghost" size="lg" aria-label="Perfil" className={className}>
    <NavLink to={to}>
      <Person width={22} height={22} />
    </NavLink>
  </IconButton>
)
