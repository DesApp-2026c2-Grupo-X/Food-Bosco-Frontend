import { Box, HStack, Link as ChakraLink, Text, VStack } from '@chakra-ui/react'
import Check from '@gravity-ui/icons/Check'
import ChevronRight from '@gravity-ui/icons/ChevronRight'
import MapPin from '@gravity-ui/icons/MapPin'
import { NavLink } from 'react-router-dom'
import { Muted, PrimaryButton, Strong } from '@repo/components'
import { useOrder } from '@repo/api'
import { tripOrderDetailPath } from '../../routes'
import { haversineDistanceMeters } from '../../utils/distance'
import type { TripOrderCardProps } from './types'

const PROXIMITY_LIMIT_M = 50

export const TripOrderCard = ({
  tripOrder,
  isLoading,
  riderLocation,
  onPickup,
  onDeliver,
}: TripOrderCardProps) => {
  const { order } = useOrder(tripOrder.orderId)
  const delivered = tripOrder.status === 'DELIVERED'
  const pickedUp = delivered || tripOrder.status === 'ON_THE_WAY'

  const location =
    riderLocation != null ? { lat: riderLocation.latitude, lon: riderLocation.longitude } : null

  const pickupMeters =
    location != null
      ? haversineDistanceMeters(location, {
          lat: tripOrder.pickupLocation.latitude,
          lon: tripOrder.pickupLocation.longitude,
        })
      : Number.POSITIVE_INFINITY

  const deliveryMeters =
    location != null
      ? haversineDistanceMeters(location, {
          lat: tripOrder.deliveryAddress.latitude,
          lon: tripOrder.deliveryAddress.longitude,
        })
      : Number.POSITIVE_INFINITY

  const targetMeters = pickedUp ? deliveryMeters : pickupMeters
  const inRange = targetMeters <= PROXIMITY_LIMIT_M

  const distanceHint =
    riderLocation != null && !inRange
      ? `Estás a ${Math.round(targetMeters)} m del punto de ${
          pickedUp ? 'entrega' : 'retiro'
        }. Acercate para continuar.`
      : null

  return (
    <Box
      bg="bg.panel"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="2xl"
      padding="4"
    >
      <ChakraLink asChild display="block">
        <NavLink to={tripOrderDetailPath(tripOrder.orderId)}>
          <HStack justify="space-between" gap="2">
            <Strong>Pedido #{order?.number ?? tripOrder.orderId}</Strong>
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
          <Text fontSize="sm">Retiro: {order?.branch?.addressText ?? 'Sucursal'}</Text>
        </HStack>
        <HStack gap="2" color="fg.muted">
          <MapPin width={16} height={16} />
          <Text fontSize="sm">Entrega: {tripOrder.deliveryAddress.text}</Text>
        </HStack>
      </VStack>

      <Box marginTop="3" borderTop="1px" borderColor="border.subtle" paddingTop="3">
        {delivered ? (
          <HStack gap="1.5" color="success">
            <Check width={18} height={18} />
            <Strong fontSize="sm">Entregado</Strong>
          </HStack>
        ) : (
          <>
            <PrimaryButton
              size="md"
              width="full"
              onClick={pickedUp ? onDeliver : onPickup}
              loading={isLoading}
              disabled={!inRange}
            >
              {pickedUp ? 'Entregar' : 'Retirar'}
            </PrimaryButton>
            {distanceHint ? (
              <Muted fontSize="sm" marginTop="2">
                {distanceHint}
              </Muted>
            ) : null}
          </>
        )}
      </Box>
    </Box>
  )
}
