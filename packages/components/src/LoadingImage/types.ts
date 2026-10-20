import type { BoxProps, ImageProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'

export interface LoadingImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src?: string | null
  alt: string
  containerProps?: BoxProps
  fallback?: ReactNode
}
