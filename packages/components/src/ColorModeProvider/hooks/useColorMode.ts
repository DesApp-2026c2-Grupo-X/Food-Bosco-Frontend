import { useTheme } from 'next-themes'

export interface UseColorModeReturn {
  colorMode: 'light' | 'dark' | undefined
  setColorMode: (value: 'light' | 'dark') => void
  toggleColorMode: () => void
}

export const useColorMode = (): UseColorModeReturn => {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleColorMode = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return {
    colorMode: resolvedTheme as 'light' | 'dark' | undefined,
    setColorMode: setTheme,
    toggleColorMode,
  }
}
