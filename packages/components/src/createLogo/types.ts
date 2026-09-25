import type { ComponentType } from 'react'
import type { LogoProps } from '../Logo/types'

export type LogoVariantProps = Omit<LogoProps, 'lightSrc' | 'darkSrc'>

export type LogoVariantComponent = ComponentType<LogoVariantProps>
