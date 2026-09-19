import type { ReactNode } from 'react'

export interface ConfirmDeleteModalProps {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel?: string
  isSubmitting?: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
}
