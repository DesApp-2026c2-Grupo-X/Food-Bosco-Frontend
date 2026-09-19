import { ControlledField } from '../ControlledField'
import { ImageUploadField } from '../ImageUploadField'
import type { FormImageFieldProps } from './types'

export const FormImageField = ({ name, label, required, ...props }: FormImageFieldProps) => (
  <ControlledField
    name={name}
    label={label}
    required={required}
    component={ImageUploadField}
    fieldProps={props}
  />
)
