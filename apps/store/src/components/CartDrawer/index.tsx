import { HStack, VStack } from '@chakra-ui/react'
import ShoppingCart from '@gravity-ui/icons/ShoppingCart'
import { Link } from 'react-router-dom'
import { routes } from '../../routes'
import { useCart } from '@repo/api'
import { cartTotal, formatPrice } from '@repo/domain'
import { CartLineCard } from '../CartLineCard'
import { EmptyState, Muted, Price, PrimaryButton, SidePanel } from '@repo/components'
import type { CartDrawerProps } from './types'

export const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  const { cart, updateItem, removeItem } = useCart()
  const lines = cart?.items ?? []
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
          {lines.map((item) => (
            <CartLineCard
              key={item.id}
              item={item}
              onQuantityChange={(id, quantity) => void updateItem(id, { quantity })}
              onRemove={removeItem}
            />
          ))}
        </VStack>
      )}
    </SidePanel>
  )
}
