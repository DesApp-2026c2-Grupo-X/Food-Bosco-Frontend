import { Field } from '@chakra-ui/react'
import { PasswordInput } from '../PasswordInput'
import type { PasswordFieldProps } from './types'

export const PasswordField = ({
  label,
  required,
  invalid,
  errorText,
  ...props
}: PasswordFieldProps) => (
  <Field.Root required={required} invalid={invalid}>
    <Field.Label>{label}</Field.Label>
    <PasswordInput size="lg" borderRadius="xl" bg="bg.panel" {...props} />
    {errorText ? <Field.ErrorText>{errorText}</Field.ErrorText> : null}
  </Field.Root>
)
