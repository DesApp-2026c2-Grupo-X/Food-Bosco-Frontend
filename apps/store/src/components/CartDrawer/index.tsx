import { HStack, VStack } from '@chakra-ui/react'
import ShoppingCart from '@gravity-ui/icons/ShoppingCart'
import { Link } from 'react-router-dom'
import { routes } from '../../routes'
import { cartTotal, useCartStore } from '../../stores/cartStore'
import { formatPrice } from '@repo/domain'
import { CartLineCard } from '../CartLineCard'
import { EmptyState, Muted, Price, PrimaryButton, SidePanel } from '@repo/components'
import type { CartDrawerProps } from './types'

export const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  const lines = useCartStore((state) => state.lines)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const removeLine = useCartStore((state) => state.removeLine)
  const isEmpty = lines.length === 0

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title="Mi carrito"
      footer={
        <VStack gap="3" width="full" align="stretch">
          {!isEmpty ? (
            <HStack justify="space-between">
              <Muted>Total</Muted>
              <Price fontSize="lg">{formatPrice(cartTotal(lines))}</Price>
            </HStack>
          ) : null}
          <PrimaryButton asChild width="full" onClick={onClose}>
            <Link to={isEmpty ? routes.catalog : routes.cart}>
              {isEmpty ? 'Explorar productos' : 'Ver carrito y confirmar'}
            </Link>
          </PrimaryButton>
        </VStack>
      }
    >
      {isEmpty ? (
        <EmptyState
          icon={<ShoppingCart width={40} height={40} />}
          title="Tu carrito está vacío"
          description="Explorá el catálogo y sumá tus favoritos para armar el pedido."
        />
      ) : (
        <VStack gap="3" align="stretch">
          {lines.map((line) => (
            <CartLineCard
              key={line.id}
              line={line}
              onQuantityChange={setQuantity}
              onRemove={removeLine}
            />
          ))}
        </VStack>
      )}
    </SidePanel>
  )
}
