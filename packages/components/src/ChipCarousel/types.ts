import type { FlexProps } from '@chakra-ui/react'

export interface ChipCarouselItem {
  id: string | number
  label: string
  active: boolean
  onClick: () => void
}

export interface ChipCarouselProps extends FlexProps {
  items: ChipCarouselItem[]
}
