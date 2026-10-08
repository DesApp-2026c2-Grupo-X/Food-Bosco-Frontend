import { Field } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface FieldShellProps {
  label: string
  required?: boolean
  invalid?: boolean
  disabled?: boolean
  errorText?: string
  children: ReactNode
}

export const FieldShell = ({
  label,
  required,
  invalid,
  disabled,
  errorText,
  children,
}: FieldShellProps) => (
  <Field.Root required={required} invalid={invalid} disabled={disabled}>
    <Field.Label>{label}</Field.Label>
    {children}
    {errorText ? <Field.ErrorText>{errorText}</Field.ErrorText> : null}
  </Field.Root>
)
