import { HStack } from '@chakra-ui/react'
import type { FormRowProps } from './types'

export const FormRow = ({ children }: FormRowProps) => (
  <HStack gap="4" align="start">
    {children}
  </HStack>
)
