import { Logo as SharedLogo } from '@repo/components'
import logoLight from '../../assets/logo-light.svg'
import logoDark from '../../assets/logo-dark.svg'
import type { LogoProps } from './types'

export const Logo = ({ height, className }: LogoProps) => (
  <SharedLogo lightSrc={logoLight} darkSrc={logoDark} height={height} className={className} />
)
