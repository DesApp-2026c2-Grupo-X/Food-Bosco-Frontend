import { Controller, useFormContext } from 'react-hook-form'
import { TextAreaField } from '../TextAreaField'
import type { FormTextAreaFieldProps } from './types'

export const FormTextAreaField = ({ name, label, required, ...props }: FormTextAreaFieldProps) => {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextAreaField
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
