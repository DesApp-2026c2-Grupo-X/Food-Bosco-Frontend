import { TextAreaField } from '../TextAreaField'
import { ControlledField } from '../ControlledField'
import type { FormTextAreaFieldProps } from './types'

export const FormTextAreaField = ({ name, label, required, ...props }: FormTextAreaFieldProps) => (
  <ControlledField
    name={name}
    label={label}
    required={required}
    component={TextAreaField}
    fieldProps={props}
  />
)
