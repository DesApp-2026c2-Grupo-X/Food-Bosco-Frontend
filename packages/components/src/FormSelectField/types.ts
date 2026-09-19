import type { SelectFieldOption } from '../SelectField/types'

export interface FormSelectFieldProps {
  name: string
  label: string
  required?: boolean
  options: SelectFieldOption[]
  placeholder?: string
  width?: string
  disabled?: boolean
}
