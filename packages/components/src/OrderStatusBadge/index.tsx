import { Badge, Box } from "@chakra-ui/react"
import { ORDER_STATUS_LABELS, ORDER_STATUS_PALETTE } from "@repo/domain"
import type { OrderStatusBadgeProps } from "./types"

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  return (
    <Badge
      colorPalette={ORDER_STATUS_PALETTE[status]}
      variant="subtle"
      borderRadius="full"
      paddingX="2.5"
      paddingY="1"
      display="inline-flex"
      alignItems="center"
      gap="1.5"
    >
      <Box width="6px" height="6px" borderRadius="full" bg="currentColor" />
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  )
}
