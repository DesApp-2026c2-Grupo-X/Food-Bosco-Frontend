export interface SelectFieldOption {
  value: string
  label: string
}

export interface SelectFieldProps {
  value: string
  onChange: (value: string) => void
  options: SelectFieldOption[]
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  width?: string
}
