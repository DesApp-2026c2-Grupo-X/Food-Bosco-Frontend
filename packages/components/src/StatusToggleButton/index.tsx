import { Box, Button, HStack, Text } from '@chakra-ui/react'
import type { StatusToggleButtonProps } from './types'

const ACCENT_COLOR: Record<NonNullable<StatusToggleButtonProps['colorPalette']>, string> = {
  brand: 'brand.500',
  success: 'success',
  danger: 'danger',
}

export const StatusToggleButton = ({
  active,
  onToggle,
  activeLabel,
  inactiveLabel,
  colorPalette = 'brand',
  disabled = false,
  disabledHint,
}: StatusToggleButtonProps) => {
  const label = active ? activeLabel : inactiveLabel
  const accent = ACCENT_COLOR[colorPalette]

  return (
    <Button
      variant="outline"
      size="sm"
      borderRadius="full"
      color={active ? accent : 'fg.muted'}
      borderColor={active ? accent : 'border.emphasized'}
      _hover={{ bg: 'bg.subtle' }}
      onClick={onToggle}
      disabled={disabled}
      title={disabled ? disabledHint : undefined}
      aria-label={label}
    >
      <HStack gap="2">
        <Box width="2" height="2" borderRadius="full" bg={active ? accent : 'fg.subtle'} />
        <Text>{label}</Text>
      </HStack>
    </Button>
  )
}
