import { Controller, useFormContext } from 'react-hook-form'
import { TextField } from '../TextField'
import type { FormFieldProps } from './types'

export const FormField = ({ name, label, required, ...props }: FormFieldProps) => {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
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
