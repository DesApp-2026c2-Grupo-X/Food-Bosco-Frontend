import { Button } from '@chakra-ui/react'
import type { ChipProps } from './types'

export const Chip = ({ label, active, onClick }: ChipProps) => {
  return (
    <Button
      size="sm"
      flexShrink={0}
      onClick={onClick}
      borderRadius="full"
      paddingX="4"
      bg={active ? 'brand.500' : 'bg.panel'}
      color={active ? 'white' : 'fg.muted'}
      border="1px solid"
      borderColor={active ? 'brand.500' : 'border.subtle'}
      fontWeight={active ? 'semibold' : 'medium'}
      _hover={{ bg: active ? 'brand.500' : 'bg.muted', color: active ? 'white' : 'fg' }}
      transition="background-color 150ms, color 150ms, border-color 150ms"
    >
      {label}
    </Button>
  )
}
