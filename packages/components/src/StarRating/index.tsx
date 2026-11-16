import { useState } from 'react'
import { Box, Button, HStack } from '@chakra-ui/react'
import StarFill from '@gravity-ui/icons/StarFill'
import Star from '@gravity-ui/icons/Star'
import type { StarRatingProps } from './types'

const SIZES = { sm: 18, md: 26, lg: 34 } as const
const RATINGS = [1, 2, 3, 4, 5] as const

export const StarRating = ({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  label = 'Calificación',
  disabled = false,
}: StarRatingProps) => {
  const [hovered, setHovered] = useState<number | null>(null)
  const iconSize = SIZES[size]
  const activeValue = hovered ?? value
  const interactive = !readOnly && Boolean(onChange)

  if (!interactive) {
    return (
      <HStack
        gap="0.5"
        role="img"
        aria-label={`${label}: ${value} de 5 estrellas`}
        display="inline-flex"
      >
        {RATINGS.map((rating) => {
          const Icon = rating <= value ? StarFill : Star
          return (
            <Box
              key={rating}
              as="span"
              color={rating <= value ? 'accent.400' : 'border.emphasized'}
              aria-hidden="true"
              display="inline-flex"
            >
              <Icon width={iconSize} height={iconSize} />
            </Box>
          )
        })}
      </HStack>
    )
  }

  return (
    <HStack
      gap="1"
      role="radiogroup"
      aria-label={label}
      onMouseLeave={() => setHovered(null)}
      display="inline-flex"
    >
      {RATINGS.map((rating) => {
        const selected = rating <= activeValue
        const Icon = selected ? StarFill : Star

        return (
          <Button
            key={rating}
            type="button"
            role="radio"
            aria-checked={value === rating}
            aria-label={`${rating} ${rating === 1 ? 'estrella' : 'estrellas'}`}
            disabled={disabled}
            variant="ghost"
            minWidth="0"
            height="auto"
            padding="0"
            bg="transparent"
            cursor={disabled ? 'not-allowed' : 'pointer'}
            color={selected ? 'accent.400' : 'border.emphasized'}
            opacity={disabled ? 0.6 : 1}
            transitionProperty="transform, color"
            transitionDuration="120ms"
            _hover={
              disabled ? { bg: 'transparent' } : { bg: 'transparent', transform: 'scale(1.12)' }
            }
            _focusVisible={{
              outline: '2px solid',
              outlineColor: 'brand.500',
              outlineOffset: '2px',
              borderRadius: 'sm',
            }}
            onMouseEnter={() => setHovered(rating)}
            onFocus={() => setHovered(rating)}
            onBlur={() => setHovered(null)}
            onClick={() => onChange?.(rating)}
          >
            <Icon width={iconSize} height={iconSize} />
          </Button>
        )
      })}
    </HStack>
  )
}
