import { Logo } from '../Logo'
import type { LogoVariantComponent, LogoVariantProps } from './types'

export const createLogo = (lightSrc: string, darkSrc: string): LogoVariantComponent => {
  const LogoVariant = (props: LogoVariantProps) => (
    <Logo lightSrc={lightSrc} darkSrc={darkSrc} {...props} />
  )
  return LogoVariant
}
