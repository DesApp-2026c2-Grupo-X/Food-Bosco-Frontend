import { HStack, VStack } from '@chakra-ui/react'
import ShoppingCart from '@gravity-ui/icons/ShoppingCart'
import { Link } from 'react-router-dom'
import { routes } from '../../routes'
import { useCart } from '@repo/api'
import { cartTotal, formatPrice } from '@repo/domain'
import { CartLineCard } from '../CartLineCard'
import { EmptyState, LoadingState, Muted, Price, PrimaryButton, SidePanel } from '@repo/components'
import type { CartDrawerProps } from './types'

export const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  const { cart, isLoading, isMutating, updateItem, removeItem } = useCart()
  const lines = cart?.items ?? []
  const isEmpty = !isLoading && lines.length === 0
  const hasDiscount = Boolean(cart?.discountTotal && cart.discountTotal > 0)
  const payableTotal = cart?.total ?? cartTotal(lines)

  const body = isLoading ? (
    <LoadingState variant="list" skeletonCount={2} skeletonHeight="72px" />
  ) : isEmpty ? (
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
          disabled={isMutating}
          onQuantityChange={(id, quantity) => void updateItem(id, { quantity })}
          onRemove={removeItem}
        />
      ))}
    </VStack>
  )

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title="Mi carrito"
      footer={
        <VStack gap="3" width="full" align="stretch">
          {!isEmpty && !isLoading ? (
            <VStack gap="1" width="full" align="stretch">
              {hasDiscount ? (
                <>
                  <HStack justify="space-between">
                    <Muted fontSize="sm">Subtotal</Muted>
                    <Price fontSize="sm">{formatPrice(cart?.subtotal ?? payableTotal)}</Price>
                  </HStack>
                  <HStack justify="space-between">
                    <Muted fontSize="sm" color="success.fg">
                      Descuentos
                    </Muted>
                    <Price fontSize="sm" color="success.fg">
                      -{formatPrice(cart?.discountTotal ?? 0)}
                    </Price>
                  </HStack>
                </>
              ) : null}
              <HStack justify="space-between">
                <Muted fontWeight={hasDiscount ? 'bold' : 'normal'}>Total</Muted>
                <Price fontSize="lg" fontWeight="bold">
                  {formatPrice(payableTotal)}
                </Price>
              </HStack>
            </VStack>
          ) : null}
          <PrimaryButton asChild width="full" onClick={onClose}>
            <Link to={isEmpty ? routes.catalog : routes.cart}>
              {isEmpty ? 'Explorar productos' : 'Ver carrito y confirmar'}
            </Link>
          </PrimaryButton>
        </VStack>
      }
    >
      {body}
    </SidePanel>
  )
}
