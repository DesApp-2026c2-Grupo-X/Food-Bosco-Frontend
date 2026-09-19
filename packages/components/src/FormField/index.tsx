import { TextField } from '../TextField'
import { ControlledField } from '../ControlledField'
import type { FormFieldProps } from './types'

export const FormField = ({ name, label, required, ...props }: FormFieldProps) => (
  <ControlledField
    name={name}
    label={label}
    required={required}
    component={TextField}
    fieldProps={props}
  />
)
