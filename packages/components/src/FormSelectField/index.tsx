import { Controller, useFormContext } from 'react-hook-form'
import { FieldShell } from '../FieldShell'
import { SelectField } from '../SelectField'
import type { FormSelectFieldProps } from './types'

export const FormSelectField = ({
  name,
  label,
  required,
  options,
  placeholder,
  width = 'full',
  disabled,
}: FormSelectFieldProps) => {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FieldShell
          label={label}
          required={required}
          invalid={fieldState.invalid}
          errorText={fieldState.error?.message}
        >
          <SelectField
            value={field.value ?? ''}
            onChange={field.onChange}
            options={options}
            placeholder={placeholder}
            width={width}
            disabled={disabled}
          />
        </FieldShell>
      )}
    />
  )
}
