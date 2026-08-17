import type { PasswordInputProps } from "../PasswordInput/types"

export interface PasswordFieldProps extends PasswordInputProps {
  label: string
  required?: boolean
  invalid?: boolean
  errorText?: string
}
