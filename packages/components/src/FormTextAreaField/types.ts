import type { TextAreaFieldProps } from '../TextAreaField/types'

export interface FormTextAreaFieldProps extends Omit<
  TextAreaFieldProps,
  'name' | 'value' | 'onChange' | 'onBlur' | 'invalid' | 'errorText'
> {
  name: string
}
