import { IconButton } from '@chakra-ui/react'
import Moon from '@gravity-ui/icons/Moon'
import Sun from '@gravity-ui/icons/Sun'
import { useColorMode } from './hooks/useColorMode'

export const ColorModeButton = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  return (
    <IconButton
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      variant="ghost"
      onClick={toggleColorMode}
    >
      {isDark ? <Sun width={20} height={20} /> : <Moon width={20} height={20} />}
    </IconButton>
  )
}
