import { Input, InputGroup } from '@chakra-ui/react'
import Magnifier from '@gravity-ui/icons/Magnifier'
import type { SearchInputProps } from './types'

export const SearchInput = ({ placeholder = 'Buscar...', ...props }: SearchInputProps) => (
  <InputGroup startElement={<Magnifier width={16} height={16} color="fg.subtle" />} maxW="sm">
    <Input placeholder={placeholder} size="lg" borderRadius="full" bg="bg.panel" {...props} />
  </InputGroup>
)
