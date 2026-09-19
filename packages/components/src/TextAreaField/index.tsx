import { Textarea } from '@chakra-ui/react'
import { FieldShell } from '../FieldShell'
import { fieldInputProps } from '../FieldShell/fieldInputProps'
import type { TextAreaFieldProps } from './types'

export const TextAreaField = ({
  label,
  required,
  invalid,
  errorText,
  ...props
}: TextAreaFieldProps) => (
  <FieldShell label={label} required={required} invalid={invalid} errorText={errorText}>
    <Textarea {...fieldInputProps} {...props} />
  </FieldShell>
)
