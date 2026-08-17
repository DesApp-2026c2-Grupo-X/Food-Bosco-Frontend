import type { PasswordFieldProps } from '../PasswordField/types'

export interface FormPasswordFieldProps extends Omit<
  PasswordFieldProps,
  'name' | 'value' | 'onChange' | 'onBlur' | 'invalid' | 'errorText'
> {
  name: string
}
