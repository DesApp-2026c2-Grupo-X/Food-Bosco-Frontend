import { PasswordInput } from '../PasswordInput'
import { FieldShell } from '../FieldShell'
import { fieldInputProps } from '../FieldShell/fieldInputProps'
import type { PasswordFieldProps } from './types'

export const PasswordField = ({
  label,
  required,
  invalid,
  errorText,
  ...props
}: PasswordFieldProps) => (
  <FieldShell label={label} required={required} invalid={invalid} errorText={errorText}>
    <PasswordInput {...fieldInputProps} {...props} />
  </FieldShell>
)
