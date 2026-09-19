import { useMediaQuery } from '@chakra-ui/react'

export const useIsDesktop = () => {
  const [isDesktop] = useMediaQuery(['(min-width: 48em)'], { ssr: false })
  return isDesktop
}
