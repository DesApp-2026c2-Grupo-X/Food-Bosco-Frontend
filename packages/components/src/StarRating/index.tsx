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
    const clamped = Math.min(5, Math.max(0, value))
    const rounded = Math.round(clamped * 2) / 2
    const formattedValue = Number.isInteger(clamped) ? String(clamped) : clamped.toFixed(1)

    return (
      <HStack
        gap="0.5"
        role="img"
        aria-label={`${label}: ${formattedValue} de 5 estrellas`}
        display="inline-flex"
      >
        {RATINGS.map((rating) => {
          const state = rating <= rounded ? 'full' : rating - 0.5 === rounded ? 'half' : 'empty'

          if (state === 'half') {
            return (
              <Box
                key={rating}
                as="span"
                position="relative"
                display="inline-flex"
                width={`${iconSize}px`}
                height={`${iconSize}px`}
                aria-hidden="true"
                data-star-state="half"
              >
                <Box as="span" color="border.emphasized" display="inline-flex">
                  <Star width={iconSize} height={iconSize} />
                </Box>
                <Box
                  as="span"
                  position="absolute"
                  inset="0"
                  width="50%"
                  overflow="hidden"
                  color="accent.400"
                  display="inline-flex"
                >
                  <Box as="span" display="inline-flex" flexShrink={0}>
                    <StarFill width={iconSize} height={iconSize} />
                  </Box>
                </Box>
              </Box>
            )
          }

          const Icon = state === 'full' ? StarFill : Star
          return (
            <Box
              key={rating}
              as="span"
              color={state === 'full' ? 'accent.400' : 'border.emphasized'}
              aria-hidden="true"
              display="inline-flex"
              data-star-state={state}
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
            <Box as="span" pointerEvents="none" display="inline-flex" aria-hidden="true">
              <Icon width={iconSize} height={iconSize} />
            </Box>
          </Button>
        )
      })}
    </HStack>
  )
}
