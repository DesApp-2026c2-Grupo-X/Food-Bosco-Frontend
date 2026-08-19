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
  TextField,
} from '@repo/components'
import { EmptyState } from '@repo/components'
import { routes } from '../../routes'
import { cartTotal, lineTotal, useCartStore } from '../../stores/cartStore'
import { useAddressStore } from '../../stores/addressStore'
import { useAddresses } from '@repo/api'
import { formatPrice } from '@repo/domain'

export const CheckoutPage = () => {
  const lines = useCartStore((state) => state.lines)
  const clear = useCartStore((state) => state.clear)
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId)
  const { addresses } = useAddresses()
  const selected = addresses.find((a) => a.id === selectedAddressId)
  const [confirmed, setConfirmed] = useState(false)
  const [address, setAddress] = useState(selected?.text ?? '')
  const [city, setCity] = useState(selected?.city ?? '')
  const total = cartTotal(lines)

  const addressComplete = address.trim() !== '' && city.trim() !== ''

  if (confirmed) {
    return (
      <VStack align="center" gap="4" paddingY="16" textAlign="center">
        <Box color="success">
          <CircleCheckFill width={56} height={56} />
        </Box>
        <PageTitle>¡Pedido confirmado!</PageTitle>
        <VStack gap="1">
          <Strong>Pedido #000128</Strong>
          <Muted>
            Envío a {address}, {city}
          </Muted>
          <Muted>Sucursal asignada: Centro · Tiempo estimado: 35 min</Muted>
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

  if (lines.length === 0) {
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
        <VStack gap="4" align="stretch">
          <TextField
            label="Calle y número"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Av. Ejemplo 123"
          />
          <TextField
            label="Localidad"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Hurlingham"
          />
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
          {lines.map((line) => (
            <HStack key={line.id} justify="space-between">
              <Text>
                {line.quantity} × {line.name}
              </Text>
              <Price fontWeight="medium">{formatPrice(lineTotal(line))}</Price>
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
        disabled={!addressComplete}
        onClick={() => {
          clear()
          setConfirmed(true)
        }}
      >
        Confirmar pedido
      </PrimaryButton>
    </PageContainer>
  )
}
