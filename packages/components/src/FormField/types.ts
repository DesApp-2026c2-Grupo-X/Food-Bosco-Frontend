import type { TextFieldProps } from '../TextField/types'

export interface FormFieldProps extends Omit<
  TextFieldProps,
  'name' | 'value' | 'onChange' | 'onBlur' | 'invalid' | 'errorText'
> {
  name: string
}
