import { Controller, useFormContext } from 'react-hook-form'
import { PasswordField } from '../PasswordField'
import type { FormPasswordFieldProps } from './types'

export const FormPasswordField = ({ name, label, required, ...props }: FormPasswordFieldProps) => {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <PasswordField
          label={label}
          required={required}
          {...props}
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          invalid={fieldState.invalid}
          errorText={fieldState.error?.message}
        />
      )}
    />
  )
}
