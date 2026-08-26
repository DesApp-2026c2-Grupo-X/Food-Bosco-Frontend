import type { TextareaProps } from '@chakra-ui/react'

export interface TextAreaFieldProps extends TextareaProps {
  label: string
  required?: boolean
  invalid?: boolean
  errorText?: string
}
