import { useState } from 'react'
import { Badge, Box, Grid, HStack, Input, Text, VStack } from '@chakra-ui/react'
import ShoppingCart from '@gravity-ui/icons/ShoppingCart'
import Tag from '@gravity-ui/icons/Tag'
import { Link } from 'react-router-dom'
import { CartLineCard } from '../../components/CartLineCard'
import {
  Card,
  EmptyState,
  GhostButton,
  LoadingState,
  Muted,
  OrderTotalCard,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  Strong,
  WidePageContainer,
  notifyError,
  notifySuccess,
} from '@repo/components'
import { routes } from '../../routes'
import { getApiErrorMessage } from '@repo/api'
import { useStoreCart } from '../../hooks/useStoreCart'
import { cartItemCount, cartTotal } from '@repo/domain'

const rejectedCouponHint = (reason: string): string => {
  switch (reason) {
    case 'PROMOTION_MIN_SUBTOTAL_NOT_MET':
      return 'no alcanza el monto mínimo de compra en este momento.'
    case 'PROMOTION_MIN_QUANTITY_NOT_MET':
      return 'no alcanza la cantidad mínima de unidades en este momento.'
    case 'PROMOTION_SCOPE_NOT_MET':
      return 'no aplica a los productos actuales del carrito.'
    case 'PROMOTION_BRANCH_NOT_ALLOWED':
      return 'no aplica para la sucursal de tu dirección seleccionada.'
    case 'PROMOTION_SCHEDULE_NOT_MET':
      return 'no está vigente en este día u horario.'
    case 'PROMOTION_LIMIT_REACHED':
      return 'alcanzó su límite de usos.'
    default:
      return 'no aplica en este momento.'
  }
}

export const CartPage = () => {
  const {
    cart,
    isLoading,
    isMutating,
    updateItem,
    removeItem,
    applyPromotionCode,
    removePromotionCode,
  } = useStoreCart()
  const [couponInput, setCouponInput] = useState('')
  const lines = cart?.items ?? []

  const count = cartItemCount(lines)
  const total = cart?.total ?? cartTotal(lines)

  if (isLoading) {
    return <LoadingState variant="list" skeletonCount={3} skeletonHeight="88px" />
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

        <VStack gap="4" align="stretch" position={{ md: 'sticky' }} top="24">
          <Card variant="subtle">
            <VStack gap="3" align="stretch">
              <HStack gap="2">
                <Tag width={18} height={18} />
                <Strong fontSize="sm">Cupón de descuento</Strong>
              </HStack>
              {cart?.promotionCode ? (
                <VStack gap="2" align="stretch">
                  <HStack
                    justify="space-between"
                    bg="bg.panel"
                    padding="2"
                    borderRadius="md"
                    border="1px solid"
                    borderColor={cart.rejectedPromotionCode ? 'warning.border' : 'border.subtle'}
                  >
                    <HStack gap="2">
                      <Badge colorPalette={cart.rejectedPromotionCode ? 'warning' : 'brand'}>
                        {cart.promotionCode}
                      </Badge>
                      <Muted fontSize="xs">
                        {cart.rejectedPromotionCode ? 'No aplica' : 'Aplicado'}
                      </Muted>
                    </HStack>
                    <GhostButton
                      size="xs"
                      disabled={isMutating}
                      onClick={async () => {
                        try {
                          if (removePromotionCode) await removePromotionCode()
                          notifySuccess({ title: 'Cupón removido' })
                        } catch (err) {
                          notifyError({
                            title: 'Error al quitar cupón',
                            description: getApiErrorMessage(err),
                          })
                        }
                      }}
                      aria-label="Quitar cupón"
                    >
                      Quitar
                    </GhostButton>
                  </HStack>
                  {cart.rejectedPromotionCode ? (
                    <Box
                      padding="2"
                      borderRadius="md"
                      bg="warning.subtle"
                      border="1px solid"
                      borderColor="warning.border"
                    >
                      <Text fontSize="xs" color="warning.fg">
                        El cupón {cart.promotionCode}{' '}
                        {rejectedCouponHint(cart.rejectedPromotionCode.reason)} Podés agregar más
                        productos o quitarlo.
                      </Text>
                    </Box>
                  ) : null}
                </VStack>
              ) : (
                <HStack gap="2">
                  <Input
                    placeholder="CÓDIGO"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    disabled={isMutating}
                    size="sm"
                    textTransform="uppercase"
                  />
                  <SecondaryButton
                    size="sm"
                    disabled={!couponInput.trim() || isMutating}
                    loading={isMutating}
                    onClick={async () => {
                      if (!couponInput.trim()) return
                      try {
                        if (applyPromotionCode) await applyPromotionCode(couponInput.trim())
                        setCouponInput('')
                        notifySuccess({ title: 'Cupón aplicado con éxito' })
                      } catch (err) {
                        notifyError({
                          title: 'No se pudo aplicar el cupón',
                          description: getApiErrorMessage(err, 'Cupón inválido o expirado'),
                        })
                      }
                    }}
                  >
                    Aplicar
                  </SecondaryButton>
                </HStack>
              )}
            </VStack>
          </Card>

          <OrderTotalCard
            subtotal={cart?.subtotal ?? total}
            discountTotal={cart?.discountTotal ?? 0}
            appliedPromotions={cart?.appliedPromotions ?? []}
            total={cart?.total ?? total}
            subtitle="La sucursal se asigna automáticamente. No se paga en línea."
          />

          <PrimaryButton asChild width="full">
            <Link to={routes.checkout}>Continuar con el pedido</Link>
          </PrimaryButton>
        </VStack>
      </Grid>
    </WidePageContainer>
  )
}
