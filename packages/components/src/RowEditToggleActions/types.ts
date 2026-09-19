import type { ReactNode } from 'react'

export interface RowEditToggleActionsProps {
  onEdit?: () => void
  checked?: boolean
  onToggle?: (checked: boolean) => void
  disabled?: boolean
  ariaLabel?: string
  extra?: ReactNode
  readOnlyText?: string
}
