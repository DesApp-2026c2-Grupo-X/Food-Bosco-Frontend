import { Box, Image, Skeleton } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
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
  const imageRef = useRef<HTMLImageElement>(null)
  const [status, setStatus] = useState<ImageStatus>(src ? 'loading' : 'error')

  useEffect(() => {
    if (!src) {
      setStatus('error')
      return
    }

    const img = imageRef.current
    if (img?.complete && img.naturalWidth > 0) {
      setStatus('loaded')
      return
    }

    setStatus('loading')
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
          ref={imageRef}
          src={src}
          alt={alt}
          position="relative"
          width="100%"
          height="100%"
          objectFit="cover"
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
