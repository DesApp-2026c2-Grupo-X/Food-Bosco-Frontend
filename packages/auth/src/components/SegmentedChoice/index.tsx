import { Button, HStack } from '@chakra-ui/react'
import type { SegmentedChoiceProps } from './types'

export const SegmentedChoice = ({ value, onChange, options }: SegmentedChoiceProps) => {
  return (
    <HStack gap="2">
      {options.map((option) => {
        const selected = option.value === value

        return (
          <Button
            key={option.value}
            type="button"
            flex="1"
            variant={selected ? 'solid' : 'outline'}
            bg={selected ? 'brand.500' : 'transparent'}
            color={selected ? 'white' : 'fg.muted'}
            borderColor="border.emphasized"
            borderRadius="full"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        )
      })}
    </HStack>
  )
}
