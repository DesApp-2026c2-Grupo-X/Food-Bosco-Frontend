import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import CircleCheckFill from '@gravity-ui/icons/CircleCheckFill'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BackButton,
  Card,
  EmptyState,
  Muted,
  OrderItemsCard,
  OrderTotalCard,
  PageContainer,
  PageHeader,
  PageTitle,
  PrimaryButton,
  SecondaryButton,
  Strong,
} from '@repo/components'
import { routes } from '../../routes'
import { useAddressStore } from '../../stores/addressStore'
import { useAddresses, useCart, useCreateOrder } from '@repo/api'
import { cartLineTotal, cartTotal, formatEta, type Order } from '@repo/domain'

export const CheckoutPage = () => {
  const { cart, isLoading } = useCart()
  const { createOrder, isLoading: isCreating } = useCreateOrder()
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId)
  const { addresses } = useAddresses()
  const selected = addresses.find((a) => a.id === selectedAddressId)
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)

  const lines = cart?.items ?? []
  const total = cart?.total ?? cartTotal(lines)

  if (confirmedOrder) {
    return (
      <VStack align="center" gap="4" paddingY="16" textAlign="center">
        <Box color="success">
          <CircleCheckFill width={56} height={56} />
        </Box>
        <PageTitle>¡Pedido confirmado!</PageTitle>
        <VStack gap="1">
          <Strong>Pedido #{confirmedOrder.number}</Strong>
          <Muted>Envío a {confirmedOrder.deliveryAddress.text}</Muted>
          <Muted>
            Sucursal asignada: {confirmedOrder.branch?.name ?? 'Pendiente'} ·{' '}
            {confirmedOrder.estimatedDeliveryAt
              ? `Tiempo estimado: ${formatEta(confirmedOrder.estimatedDeliveryAt)}`
              : 'Estimando tiempo'}
          </Muted>
        </VStack>
        <HStack gap="3" flexWrap="wrap" justifyContent="center" marginTop="2">
          <PrimaryButton asChild paddingX="7">
            <Link to={routes.orders}>Ver mis pedidos</Link>
          </PrimaryButton>
          <SecondaryButton asChild paddingX="7">
            <Link to={routes.home}>Volver al inicio</Link>
          </SecondaryButton>
        </HStack>
      </VStack>
    )
  }

  if (!isLoading && lines.length === 0) {
    return (
      <EmptyState
        title="Nada para confirmar"
        description="Tu carrito está vacío. Sumá productos antes de continuar."
        action={
          <PrimaryButton asChild>
            <Link to={routes.catalog}>Ir al catálogo</Link>
          </PrimaryButton>
        }
      />
    )
  }

  return (
    <PageContainer>
      <BackButton />
      <PageHeader title="Confirmar pedido" description="¿A dónde te lo llevamos?" />

      <Card>
        <Strong marginBottom="4">Dirección de entrega</Strong>
        <VStack gap="1" align="stretch">
          <Text>{selected?.text ?? 'Dirección seleccionada'}</Text>
          <Muted fontSize="sm">
            {selected?.city ?? ''}
            {selected?.city && selected?.postalCode ? ' · ' : ''}
            {selected?.postalCode ?? ''}
          </Muted>
        </VStack>
      </Card>

      <OrderItemsCard
        items={lines.map((item) => ({
          productId: String(item.id),
          name: item.product?.name ?? '',
          quantity: item.quantity,
          subtotal: cartLineTotal(item),
        }))}
      />

      <OrderTotalCard
        total={total}
        subtitle="La sucursal se asigna automáticamente al confirmar. No se paga en línea."
      />

      {error ? (
        <Text color="danger" fontSize="sm">
          {error}
        </Text>
      ) : null}
      <PrimaryButton
        width="full"
        loading={isCreating}
        disabled={!selectedAddressId}
        onClick={async () => {
          if (!selectedAddressId) return
          setError(null)
          try {
            const order = await createOrder(selectedAddressId)
            if (order) setConfirmedOrder(order)
          } catch {
            setError('No pudimos confirmar tu pedido. Intentá de nuevo.')
          }
        }}
      >
        Confirmar pedido
      </PrimaryButton>
    </PageContainer>
  )
}
