import { Box, HStack, Text } from '@chakra-ui/react'
import { Muted } from '../Muted'
import { ToggleSwitch } from '../ToggleSwitch'
import type { SwitchRowProps } from './types'

export const SwitchRow = ({
  label,
  checked,
  onChange,
  ariaLabel,
  description,
  disabled,
}: SwitchRowProps) => (
  <HStack justify="space-between" align="start" gap="4">
    <Box>
      <Text fontSize="sm" color="fg.muted">
        {label}
      </Text>
      {description ? (
        <Muted fontSize="xs" marginTop="0.5">
          {description}
        </Muted>
      ) : null}
    </Box>
    <ToggleSwitch
      checked={checked}
      onChange={onChange}
      ariaLabel={ariaLabel ?? label}
      disabled={disabled}
    />
  </HStack>
)
