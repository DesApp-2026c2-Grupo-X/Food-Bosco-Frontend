import { Button, HStack, Text } from '@chakra-ui/react'
import Minus from '@gravity-ui/icons/Minus'
import Plus from '@gravity-ui/icons/Plus'
import type { QuantityStepperProps } from './types'

export const QuantityStepper = ({ value, onChange, min = 1, max = 99 }: QuantityStepperProps) => {
  return (
    <HStack gap="0" bg="bg.muted" borderRadius="full" padding="1">
      <Button
        size="xs"
        variant="ghost"
        borderRadius="full"
        aria-label="Quitar uno"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
      >
        <Minus width={14} height={14} />
      </Button>
      <Text minWidth="6" textAlign="center" fontWeight="semibold" fontVariantNumeric="tabular-nums">
        {value}
      </Text>
      <Button
        size="xs"
        variant="ghost"
        borderRadius="full"
        aria-label="Agregar uno"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
      >
        <Plus width={14} height={14} />
      </Button>
    </HStack>
  )
}
