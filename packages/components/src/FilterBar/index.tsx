import { HStack } from '@chakra-ui/react'
import type { FilterBarProps } from './types'

export const FilterBar = ({ children, ...props }: FilterBarProps) => (
  <HStack gap="3" wrap="wrap" width="full" {...props}>
    {children}
  </HStack>
)
