import { Switch } from '@chakra-ui/react'
import type { ToggleSwitchProps } from './types'

export const ToggleSwitch = ({
  checked,
  onChange,
  disabled = false,
  loading = false,
  colorPalette = 'brand',
  ariaLabel,
}: ToggleSwitchProps) => (
  <Switch.Root
    checked={checked}
    onCheckedChange={({ checked }) => onChange(checked)}
    disabled={disabled || loading}
    colorPalette={colorPalette}
    aria-label={ariaLabel}
  >
    <Switch.Control>
      <Switch.Thumb />
    </Switch.Control>
  </Switch.Root>
)
