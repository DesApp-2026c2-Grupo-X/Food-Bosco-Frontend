import { Text } from "@chakra-ui/react"
import type { PriceProps } from "./types"

export const Price = (props: PriceProps) => (
  <Text fontWeight="semibold" fontVariantNumeric="tabular-nums" {...props} />
)
