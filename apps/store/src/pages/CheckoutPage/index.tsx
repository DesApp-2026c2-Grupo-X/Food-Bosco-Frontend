import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import CircleCheckFill from '@gravity-ui/icons/CircleCheckFill'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BackButton,
  Muted,
  PageContainer,
  PageTitle,
  Price,
  PrimaryButton,
  SecondaryButton,
  Strong,
  Subtle,
} from '@repo/components'
import { EmptyState } from '@repo/components'
import { routes } from '../../routes'
import { useAddressStore } from '../../stores/addressStore'
import { useAddresses, useCart, useCreateOrder } from '@repo/api'
import { cartLineTotal, cartTotal, formatPrice, type Order } from '@repo/domain'

export const CheckoutPage = () => {
  const { cart, isLoading } = useCart()
  const { createOrder, isLoading: isCreating } = useCreateOrder()
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId)
  const { addresses } = useAddresses()
  const selected = addresses.find((a) => a.id === selectedAddressId)
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null)

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
              ? `Tiempo estimado: ${formatEtaLabel(confirmedOrder.estimatedDeliveryAt)}`
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
      <VStack align="start" gap="1">
        <PageTitle>Confirmar pedido</PageTitle>
        <Muted>¿A dónde te lo llevamos?</Muted>
      </VStack>

      <Box
        bg="bg.panel"
        border="1px solid"
        borderColor="border.subtle"
        borderRadius="2xl"
        padding="5"
      >
        <Strong marginBottom="4">Dirección de entrega</Strong>
        <VStack gap="1" align="stretch">
          <Text>{selected?.text ?? 'Dirección seleccionada'}</Text>
          <Muted fontSize="sm">
            {selected?.city ?? ''}
            {selected?.city && selected?.postalCode ? ' · ' : ''}
            {selected?.postalCode ?? ''}
          </Muted>
        </VStack>
      </Box>

      <Box
        bg="bg.panel"
        border="1px solid"
        borderColor="border.subtle"
        borderRadius="2xl"
        padding="5"
      >
        <Muted fontSize="sm" marginBottom="3">
          Productos
        </Muted>
        <VStack gap="3" align="stretch">
          {lines.map((item) => (
            <HStack key={item.id} justify="space-between">
              <Text>
                {item.quantity} × {item.product?.name}
              </Text>
              <Price fontWeight="medium">{formatPrice(cartLineTotal(item))}</Price>
            </HStack>
          ))}
        </VStack>
      </Box>

      <Box
        bg="bg.subtle"
        border="1px solid"
        borderColor="border.subtle"
        borderRadius="2xl"
        padding="5"
      >
        <HStack justify="space-between" marginBottom="3">
          <Strong>Total</Strong>
          <Price fontWeight="bold" fontSize="xl">
            {formatPrice(total)}
          </Price>
        </HStack>
        <Subtle fontSize="sm">
          La sucursal se asigna automáticamente al confirmar. No se paga en línea.
        </Subtle>
      </Box>

      <PrimaryButton
        width="full"
        loading={isCreating}
        disabled={!selectedAddressId}
        onClick={async () => {
          if (!selectedAddressId) return
          const order = await createOrder(selectedAddressId)
          if (order) setConfirmedOrder(order)
        }}
      >
        Confirmar pedido
      </PrimaryButton>
    </PageContainer>
  )
}

const formatEtaLabel = (iso: string) => {
  const minutes = Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 60000))
  return minutes < 60 ? `~${minutes} min` : `~${Math.floor(minutes / 60)}h ${minutes % 60}m`
}
