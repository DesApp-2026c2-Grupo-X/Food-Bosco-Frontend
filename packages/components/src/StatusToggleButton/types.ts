export interface StatusToggleButtonProps {
  active: boolean
  onToggle: () => void
  activeLabel: string
  inactiveLabel: string
  colorPalette?: 'brand' | 'success' | 'danger'
  disabled?: boolean
  disabledHint?: string
}
