import { PasswordField } from '../PasswordField'
import { ControlledField } from '../ControlledField'
import type { FormPasswordFieldProps } from './types'

export const FormPasswordField = ({ name, label, required, ...props }: FormPasswordFieldProps) => (
  <ControlledField
    name={name}
    label={label}
    required={required}
    component={PasswordField}
    fieldProps={props}
  />
)
