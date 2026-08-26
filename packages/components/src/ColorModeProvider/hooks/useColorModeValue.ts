import { useColorMode } from './useColorMode'

export const useColorModeValue = <T>(light: T, dark: T): T => {
  const { colorMode } = useColorMode()
  return colorMode === 'dark' ? dark : light
}
