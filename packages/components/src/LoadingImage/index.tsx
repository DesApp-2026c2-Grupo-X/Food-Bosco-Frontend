import { Box, Image, Skeleton } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '../usePrefersReducedMotion'
import type { LoadingImageProps } from './types'

type ImageStatus = 'loading' | 'loaded' | 'error'

export const LoadingImage = ({
  src,
  alt,
  containerProps,
  fallback,
  ...props
}: LoadingImageProps) => {
  const reducedMotion = usePrefersReducedMotion()
  const [status, setStatus] = useState<ImageStatus>(src ? 'loading' : 'error')

  useEffect(() => {
    setStatus(src ? 'loading' : 'error')
  }, [src])

  return (
    <Box
      position="relative"
      width="100%"
      height="100%"
      overflow="hidden"
      bg="bg.muted"
      {...containerProps}
    >
      {status === 'loading' ? (
        <Skeleton
          position="absolute"
          inset="0"
          borderRadius="inherit"
          animation={reducedMotion ? 'none' : undefined}
        />
      ) : null}

      {src && status !== 'error' ? (
        <Image
          src={src}
          alt={alt}
          width="100%"
          height="100%"
          objectFit="cover"
          opacity={status === 'loaded' ? 1 : 0}
          transitionProperty={reducedMotion ? undefined : 'opacity'}
          transitionDuration={reducedMotion ? undefined : '180ms'}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          {...props}
        />
      ) : (
        fallback
      )}
    </Box>
  )
}
