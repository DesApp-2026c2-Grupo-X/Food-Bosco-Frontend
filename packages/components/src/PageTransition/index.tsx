import { Box } from '@chakra-ui/react'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { usePrefersReducedMotion } from '../usePrefersReducedMotion'
import type { PageTransitionProps } from './types'

export const PageTransition = ({ children }: PageTransitionProps) => {
  const { pathname } = useLocation()
  const reducedMotion = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }

    if (reducedMotion || !ref.current || typeof ref.current.animate !== 'function') return

    ref.current.animate(
      [
        { opacity: 0, transform: 'translateY(6px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: 180, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
    )
  }, [pathname, reducedMotion])

  return <Box ref={ref}>{children}</Box>
}
