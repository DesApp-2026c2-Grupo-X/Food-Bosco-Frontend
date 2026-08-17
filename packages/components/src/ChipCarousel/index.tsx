import { Flex } from "@chakra-ui/react"
import { Chip } from "../Chip"
import type { ChipCarouselProps } from "./types"

export const ChipCarousel = ({ items, ...props }: ChipCarouselProps) => (
  <Flex gap="2" overflowX="auto" paddingBottom="2" scrollSnapType="x" {...props}>
    {items.map((item) => (
      <Chip key={item.id} label={item.label} active={item.active} onClick={item.onClick} />
    ))}
  </Flex>
)
