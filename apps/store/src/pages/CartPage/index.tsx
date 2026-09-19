import { Grid, HStack, VStack } from '@chakra-ui/react'
import ShoppingCart from '@gravity-ui/icons/ShoppingCart'
import { Link } from 'react-router-dom'
import { CartLineCard } from '../../components/CartLineCard'
import {
  Card,
  EmptyState,
  LoadingState,
  Muted,
  PageHeader,
  Price,
  PrimaryButton,
  Subtle,
  WidePageContainer,
} from '@repo/components'
import { routes } from '../../routes'
import { useCart } from '@repo/api'
import { cartItemCount, cartTotal, formatPrice } from '@repo/domain'

export const CartPage = () => {
  const { cart, isLoading, isMutating, updateItem, removeItem } = useCart()
  const lines = cart?.items ?? []

  const count = cartItemCount(lines)
  const total = cart?.total ?? cartTotal(lines)

  if (isLoading) {
    return <LoadingState />
  }

  if (lines.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart width={40} height={40} />}
        title="Tu carrito está vacío"
        description="Explorá el catálogo y armá tu pedido."
        action={
          <PrimaryButton asChild>
            <Link to={routes.catalog}>Explorar productos</Link>
          </PrimaryButton>
        }
      />
    )
  }

  return (
    <WidePageContainer>
      <PageHeader title="Mi carrito" description={`${count} ${count === 1 ? 'ítem' : 'ítems'}`} />

      <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap="6" alignItems="start">
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

        <Card variant="subtle" position={{ md: 'sticky' }} top="24">
          <VStack gap="4" align="stretch">
            <HStack justify="space-between">
              <Muted>Total</Muted>
              <Price fontWeight="bold" fontSize="xl">
                {formatPrice(total)}
              </Price>
            </HStack>
            <Subtle fontSize="sm">
              La sucursal se asigna automáticamente. No se paga en línea.
            </Subtle>
            <PrimaryButton asChild width="full">
              <Link to={routes.checkout}>Continuar con el pedido</Link>
            </PrimaryButton>
          </VStack>
        </Card>
      </Grid>
    </WidePageContainer>
  )
}
