import { HStack } from '@chakra-ui/react'
import { FilterBar } from '../FilterBar'
import type { ListToolbarProps } from './types'

export const ListToolbar = ({ filters, action }: ListToolbarProps) => (
  <HStack justify="space-between" align="center" width="full" wrap="wrap" gap="3">
    <FilterBar width="auto" flexGrow="1">
      {filters}
    </FilterBar>
    {action}
  </HStack>
)
