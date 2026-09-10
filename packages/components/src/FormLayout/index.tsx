import { VStack } from '@chakra-ui/react'
import type { FormLayoutProps } from './types'

export const FormLayout = (props: FormLayoutProps) => (
  <VStack align="stretch" gap="4" maxW="3xl" width="full" {...props} />
)
