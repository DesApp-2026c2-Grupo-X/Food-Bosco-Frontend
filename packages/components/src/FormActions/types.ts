export interface FormActionsProps {
  onCancel: () => void
  submitLabel: string
  isSubmitting?: boolean
  disabled?: boolean
  cancelLabel?: string
  cancelDisabled?: boolean
}
