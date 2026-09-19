import { Input } from '@chakra-ui/react'
import { FieldShell } from '../FieldShell'
import { fieldInputProps } from '../FieldShell/fieldInputProps'
import type { TextFieldProps } from './types'

export const TextField = ({
  label,
  required,
  invalid,
  errorText,
  ...inputProps
}: TextFieldProps) => (
  <FieldShell label={label} required={required} invalid={invalid} errorText={errorText}>
    <Input {...fieldInputProps} {...inputProps} />
  </FieldShell>
)
