import { Field, Input } from '@chakra-ui/react'
import type { TextFieldProps } from './types'

export const TextField = ({
  label,
  required,
  invalid,
  errorText,
  ...inputProps
}: TextFieldProps) => (
  <Field.Root required={required} invalid={invalid}>
    <Field.Label>{label}</Field.Label>
    <Input size="lg" borderRadius="xl" bg="bg.panel" {...inputProps} />
    {errorText ? <Field.ErrorText>{errorText}</Field.ErrorText> : null}
  </Field.Root>
)
