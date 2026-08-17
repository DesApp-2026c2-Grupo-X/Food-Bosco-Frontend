import type { InputProps } from '@chakra-ui/react'

export interface TextFieldProps extends InputProps {
  label: string
  required?: boolean
  invalid?: boolean
  errorText?: string
}
