import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderHookWithProviders, renderWithProviders } from '@test/utils'
import { useColorModeValue } from '../ColorModeProvider/hooks/useColorModeValue'
import { ColorModeButton } from '../ColorModeProvider/ColorModeButton'

const theme = vi.hoisted(() => ({
  resolvedTheme: 'light' as string | undefined,
  setTheme: vi.fn(),
}))

vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: theme.resolvedTheme, setTheme: theme.setTheme }),
}))

describe('useColorModeValue', () => {
  it('returns the light value in light mode', () => {
    theme.resolvedTheme = 'light'

    const { result } = renderHookWithProviders(() => useColorModeValue('claro', 'oscuro'))

    expect(result.current).toBe('claro')
  })

  it('returns the dark value in dark mode', () => {
    theme.resolvedTheme = 'dark'

    const { result } = renderHookWithProviders(() => useColorModeValue('claro', 'oscuro'))

    expect(result.current).toBe('oscuro')
  })
})

describe('ColorModeButton', () => {
  it('offers to switch to dark mode and toggles from light', async () => {
    theme.resolvedTheme = 'light'

    renderWithProviders(<ColorModeButton />)

    const button = screen.getByRole('button', { name: 'Cambiar a modo oscuro' })
    expect(button.querySelector('svg')).toBeInTheDocument()

    await userEvent.click(button)

    expect(theme.setTheme).toHaveBeenCalledWith('dark')
  })

  it('offers to switch to light mode and toggles from dark', async () => {
    theme.resolvedTheme = 'dark'

    renderWithProviders(<ColorModeButton />)

    const button = screen.getByRole('button', { name: 'Cambiar a modo claro' })
    expect(button.querySelector('svg')).toBeInTheDocument()

    await userEvent.click(button)

    expect(theme.setTheme).toHaveBeenCalledWith('light')
  })
})
