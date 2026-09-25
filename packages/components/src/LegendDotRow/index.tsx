import { Box, HStack } from '@chakra-ui/react'
import { Muted } from '../typography'
import type { LegendDotRowProps } from './types'

export const LegendDotRow = ({ color, label }: LegendDotRowProps) => (
  <HStack gap="2">
    <Box boxSize="2" borderRadius="full" bg={color} flexShrink="0" />
    <Muted fontSize="sm">{label}</Muted>
  </HStack>
)
