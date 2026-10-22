export interface StatusToggleButtonProps {
  active: boolean
  onToggle: () => void
  activeLabel: string
  inactiveLabel: string
  /**
   * Token de color del estado activo (no el nombre de una paleta).
   * Ej: `brand.600` (naranja de marca) o `success` (verde semántico).
   */
  statusColor?: 'brand.600' | 'success' | 'danger'
  disabled?: boolean
  disabledHint?: string
}
