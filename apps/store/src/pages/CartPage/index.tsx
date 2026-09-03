import { Box, Grid, HStack, VStack } from '@chakra-ui/react'
import ShoppingCart from '@gravity-ui/icons/ShoppingCart'
import { Link } from 'react-router-dom'
import { CartLineCard } from '../../components/CartLineCard'
import {
  EmptyState,
  Muted,
  PageTitle,
  Price,
  PrimaryButton,
  Subtle,
  WidePageContainer,
} from '@repo/components'
import { routes } from '../../routes'
import { useCart } from '@repo/api'
import { cartItemCount, cartTotal, formatPrice } from '@repo/domain'

export const CartPage = () => {
  const { cart, isLoading, updateItem, removeItem } = useCart()
  const lines = cart?.items ?? []

  const count = cartItemCount(lines)
  const total = cart?.total ?? cartTotal(lines)

  if (!isLoading && lines.length === 0) {
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
      <VStack align="start" gap="1">
        <PageTitle>Mi carrito</PageTitle>
        <Muted>
          {count} {count === 1 ? 'ítem' : 'ítems'}
        </Muted>
      </VStack>

      <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap="6" alignItems="start">
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

        <Box
          position={{ md: 'sticky' }}
          top="24"
          bg="bg.subtle"
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="2xl"
          padding="5"
        >
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
        </Box>
      </Grid>
    </WidePageContainer>
  )
}
