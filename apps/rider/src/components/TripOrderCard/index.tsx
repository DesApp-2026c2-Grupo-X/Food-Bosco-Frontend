import { Box, HStack, Link as ChakraLink, Text, VStack } from '@chakra-ui/react'
import Check from '@gravity-ui/icons/Check'
import ChevronRight from '@gravity-ui/icons/ChevronRight'
import MapPin from '@gravity-ui/icons/MapPin'
import { NavLink } from 'react-router-dom'
import { Muted, PrimaryButton, Strong, SummaryCard } from '@repo/components'
import { haversineDistanceMeters } from '@repo/domain'
import { tripOrderDetailPath } from '../../routes'
import type { TripOrderCardProps } from './types'

const PROXIMITY_LIMIT_M = 50

export const TripOrderCard = ({
  tripOrder,
  order,
  isLoading,
  riderLocation,
  onPickup,
  onDeliver,
}: TripOrderCardProps) => {
  const delivered = tripOrder.status === 'DELIVERED'
  const pickedUp = delivered || tripOrder.status === 'ON_THE_WAY'

  const location =
    riderLocation != null
      ? { latitude: riderLocation.latitude, longitude: riderLocation.longitude }
      : null

  const pickupMeters =
    location != null
      ? haversineDistanceMeters(location, tripOrder.pickupLocation)
      : Number.POSITIVE_INFINITY

  const deliveryMeters =
    location != null
      ? haversineDistanceMeters(location, tripOrder.deliveryAddress)
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
    <SummaryCard
      title={
        <ChakraLink asChild>
          <NavLink to={tripOrderDetailPath(tripOrder.orderId)}>
            Pedido #{order?.number ?? tripOrder.orderId}
          </NavLink>
        </ChakraLink>
      }
      trailing={
        <ChakraLink asChild>
          <NavLink to={tripOrderDetailPath(tripOrder.orderId)}>
            <HStack gap="1" color="fg.subtle">
              <Muted fontSize="sm">Detalle</Muted>
              <ChevronRight width={16} height={16} />
            </HStack>
          </NavLink>
        </ChakraLink>
      }
    >
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
    </SummaryCard>
  )
}
