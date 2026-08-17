import { Text } from "@chakra-ui/react"
import type { EyebrowProps } from "./types"

export const Eyebrow = ({ color = "brand.600", ...props }: EyebrowProps) => (
  <Text
    fontSize="xs"
    fontWeight="semibold"
    letterSpacing="0.08em"
    textTransform="uppercase"
    color={color}
    {...props}
  />
)
