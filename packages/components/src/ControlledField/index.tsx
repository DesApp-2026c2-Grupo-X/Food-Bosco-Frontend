import { Controller, useFormContext } from 'react-hook-form'
import type { ComponentType } from 'react'

interface FieldControlProps {
  label: string
  required?: boolean
  invalid?: boolean
  errorText?: string
}

interface ControlledFieldProps<T extends FieldControlProps> {
  name: string
  label: string
  required?: boolean
  component: ComponentType<T>
  fieldProps: Omit<T, 'label' | 'required' | 'invalid' | 'errorText'>
}

export const ControlledField = <T extends FieldControlProps>({
  name,
  label,
  required,
  component: FieldComponent,
  fieldProps,
}: ControlledFieldProps<T>) => {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FieldComponent
          {...(fieldProps as T)}
          label={label}
          required={required}
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
