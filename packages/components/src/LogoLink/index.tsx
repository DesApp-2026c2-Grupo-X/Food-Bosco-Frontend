import { MenuLink } from '../MenuLink'
import type { LogoLinkProps } from './types'

export const LogoLink = ({ to, children, ariaLabel = 'Ir al inicio' }: LogoLinkProps) => (
  <MenuLink to={to} aria-label={ariaLabel} display="inline-flex" alignItems="center">
    {children}
  </MenuLink>
)
