import { Box, Button, HStack, Text } from '@chakra-ui/react'
import type { StatusToggleButtonProps } from './types'

export const StatusToggleButton = ({
  active,
  onToggle,
  activeLabel,
  inactiveLabel,
  statusColor = 'brand.600',
  disabled = false,
  disabledHint,
}: StatusToggleButtonProps) => {
  const label = active ? activeLabel : inactiveLabel

  return (
    <Button
      variant="outline"
      size="sm"
      borderRadius="full"
      color={active ? statusColor : 'fg.muted'}
      borderColor={active ? statusColor : 'border.emphasized'}
      _hover={{ bg: 'bg.subtle' }}
      onClick={onToggle}
      disabled={disabled}
      title={disabled ? disabledHint : undefined}
      aria-label={label}
    >
      <HStack gap="2">
        <Box width="2" height="2" borderRadius="full" bg={active ? 'currentColor' : 'fg.subtle'} />
        <Text>{label}</Text>
      </HStack>
    </Button>
  )
}
