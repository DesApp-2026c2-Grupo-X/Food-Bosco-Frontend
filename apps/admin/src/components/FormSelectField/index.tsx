import { Controller, useFormContext } from 'react-hook-form'
import { Field } from '@chakra-ui/react'
import { SelectField } from '@repo/components'
import type { FormSelectFieldProps } from './types'

export const FormSelectField = ({
  name,
  label,
  required,
  options,
  placeholder,
  width = 'full',
}: FormSelectFieldProps) => {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field.Root required={required} invalid={fieldState.invalid}>
          <Field.Label>{label}</Field.Label>
          <SelectField
            value={field.value ?? ''}
            onChange={field.onChange}
            options={options}
            placeholder={placeholder}
            width={width}
          />
          {fieldState.error?.message ? (
            <Field.ErrorText>{fieldState.error.message}</Field.ErrorText>
          ) : null}
        </Field.Root>
      )}
    />
  )
}
