import { NativeSelect } from '@chakra-ui/react'
import type { SelectFieldProps } from './types'

export const SelectField = ({
  value,
  onChange,
  options,
  placeholder,
  size = 'md',
  width = 'auto',
}: SelectFieldProps) => (
  <NativeSelect.Root size={size} width={width}>
    <NativeSelect.Field value={value} onChange={(event) => onChange(event.currentTarget.value)}>
      {placeholder ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </NativeSelect.Field>
    <NativeSelect.Indicator />
  </NativeSelect.Root>
)
