import type { ReactNode } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'

export interface FormModalProps<TFieldValues extends FieldValues> {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: ReactNode
  form: UseFormReturn<TFieldValues>
  onSubmit: (values: TFieldValues) => Promise<void> | void
  submitLabel?: string
  isSubmitting?: boolean
  headingMarginBottom?: '2' | '4'
  children: ReactNode
}
