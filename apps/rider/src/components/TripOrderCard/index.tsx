import { Box, HStack, Link as ChakraLink, Text, VStack } from '@chakra-ui/react'
import Check from '@gravity-ui/icons/Check'
import ChevronRight from '@gravity-ui/icons/ChevronRight'
import MapPin from '@gravity-ui/icons/MapPin'
import { NavLink } from 'react-router-dom'
import { Muted, PrimaryButton, Strong } from '@repo/components'
import { tripOrderDetailPath } from '../../routes'
import type { TripOrderCardProps } from './types'

export const TripOrderCard = ({
  tripOrder,
  isLoading,
  onPickup,
  onDeliver,
}: TripOrderCardProps) => {
  const { order, pickedUp, delivered } = tripOrder

  return (
    <Box
      bg="bg.panel"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="2xl"
      padding="4"
    >
      <ChakraLink asChild display="block">
        <NavLink to={tripOrderDetailPath(order.id)}>
          <HStack justify="space-between" gap="2">
            <Strong>Pedido #{order.number}</Strong>
            <HStack gap="1" color="fg.subtle">
              <Muted fontSize="sm">Detalle</Muted>
              <ChevronRight width={16} height={16} />
            </HStack>
          </HStack>
        </NavLink>
      </ChakraLink>

      <VStack align="start" gap="1" marginTop="3">
        <HStack gap="2" color="fg.muted">
          <MapPin width={16} height={16} />
          <Text fontSize="sm">Retiro: {order.branch?.addressText}</Text>
        </HStack>
        <HStack gap="2" color="fg.muted">
          <MapPin width={16} height={16} />
          <Text fontSize="sm">Entrega: {order.deliveryAddress.text}</Text>
        </HStack>
      </VStack>

      <Box marginTop="3" borderTop="1px" borderColor="border.subtle" paddingTop="3">
        {delivered ? (
          <HStack gap="1.5" color="success">
            <Check width={18} height={18} />
            <Strong fontSize="sm">Entregado</Strong>
          </HStack>
        ) : !pickedUp ? (
          <PrimaryButton size="md" width="full" onClick={onPickup} loading={isLoading}>
            Retirar
          </PrimaryButton>
        ) : (
          <PrimaryButton size="md" width="full" onClick={onDeliver} loading={isLoading}>
            Entregar
          </PrimaryButton>
        )}
      </Box>
    </Box>
  )
}
