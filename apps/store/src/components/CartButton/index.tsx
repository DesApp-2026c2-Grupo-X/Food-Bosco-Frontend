import { Badge, Box, IconButton } from '@chakra-ui/react'
import ShoppingCart from '@gravity-ui/icons/ShoppingCart'
import { useCartCount } from './hooks/useCartCount'
import type { CartButtonProps } from './types'

export const CartButton = ({ count: countOverride, onClick, className }: CartButtonProps) => {
  const { count: cartCount } = useCartCount()
  const count = countOverride ?? cartCount

  return (
    <Box position="relative" display="inline-flex" className={className}>
      <IconButton aria-label="Ver carrito" variant="ghost" size="lg" onClick={onClick}>
        <ShoppingCart width={22} height={22} />
      </IconButton>
      {count > 0 && (
        <Badge
          position="absolute"
          top="0"
          right="0"
          minW="4"
          height="4"
          display="flex"
          alignItems="center"
          justifyContent="center"
          paddingX="1"
          borderRadius="full"
          fontSize="xs"
          bg="brand.500"
          color="white"
        >
          {count}
        </Badge>
      )}
    </Box>
  )
}
