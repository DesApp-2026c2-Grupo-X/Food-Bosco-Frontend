export interface SwitchRowProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  ariaLabel?: string
  description?: string
  disabled?: boolean
}
