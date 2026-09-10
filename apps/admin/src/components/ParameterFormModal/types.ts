import type { Parameter } from '@repo/domain'

export interface ParameterFormModalProps {
  parameter: Parameter | null
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (value: number) => Promise<void>
}
