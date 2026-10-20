import { Box } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../usePrefersReducedMotion'
import type { RevealProps } from './types'

export const Reveal = ({
  children,
  delayMs = 0,
  offsetY = 8,
  once = true,
  ...props
}: RevealProps) => {
  const reducedMotion = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(reducedMotion)

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true)
      return
    }

    const element = ref.current
    if (!element || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry?.isIntersecting) return

        setVisible(true)
        if (once) observer.disconnect()
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [once, reducedMotion])

  return (
    <Box
      ref={ref}
      opacity={visible ? 1 : 0}
      transform={visible ? 'none' : `translateY(${offsetY}px)`}
      transitionProperty={reducedMotion ? undefined : 'opacity, transform'}
      transitionDuration={reducedMotion ? undefined : '240ms'}
      transitionTimingFunction="cubic-bezier(0.23, 1, 0.32, 1)"
      transitionDelay={reducedMotion ? undefined : `${delayMs}ms`}
      willChange={visible || reducedMotion ? undefined : 'opacity, transform'}
      {...props}
    >
      {children}
    </Box>
  )
}
