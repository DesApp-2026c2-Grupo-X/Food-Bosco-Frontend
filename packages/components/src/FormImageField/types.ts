import type { ImageUploadFieldProps } from '../ImageUploadField/types'

export interface FormImageFieldProps extends Omit<
  ImageUploadFieldProps,
  'value' | 'onChange' | 'onBlur' | 'invalid' | 'errorText'
> {
  name: string
}
