import type { SelectFieldOption } from '@repo/components'

export interface FormSelectFieldProps {
  name: string
  label: string
  required?: boolean
  options: SelectFieldOption[]
  placeholder?: string
  width?: string
}
