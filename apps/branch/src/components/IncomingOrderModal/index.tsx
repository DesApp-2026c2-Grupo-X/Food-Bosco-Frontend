import { useEffect } from 'react'
import { HStack, VStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { GhostButton, Muted, PrimaryButton, ResponsiveModal, Strong } from '@repo/components'
import { formatPrice } from '@repo/domain'
import { orderDetailPath } from '../../routes'
import { playIncomingSound, stopIncomingSound } from '../../utils/playIncomingSound'
import type { IncomingOrderModalProps } from './types'

export const IncomingOrderModal = ({ order, onClose }: IncomingOrderModalProps) => {
  const navigate = useNavigate()

  useEffect(() => {
    if (order) playIncomingSound()
    return () => stopIncomingSound()
  }, [order])

  const handleView = () => {
    if (order) {
      onClose()
      navigate(orderDetailPath(order.id))
    }
  }

  return (
    <ResponsiveModal open={order !== null} onClose={onClose}>
      <VStack align="stretch" gap="4">
        <VStack align="start" gap="1">
          <Strong fontSize="xl">Nuevo pedido #{order?.number}</Strong>
          <Muted>Llegó un pedido a tu sucursal.</Muted>
        </VStack>
        {order ? (
          <VStack
            align="start"
            gap="1"
            bg="bg.subtle"
            border="1px solid"
            borderColor="border.subtle"
            borderRadius="xl"
            padding="4"
          >
            <Strong>{order.customer?.name}</Strong>
            <Muted fontSize="sm">{order.deliveryAddress}</Muted>
            <Muted fontSize="sm">
              {order.itemCount} {order.itemCount === 1 ? 'ítem' : 'ítems'} ·{' '}
              {formatPrice(order.total)}
            </Muted>
          </VStack>
        ) : null}
        <HStack justify="end" gap="2">
          <GhostButton onClick={onClose}>Después</GhostButton>
          <PrimaryButton onClick={handleView}>Ver pedido</PrimaryButton>
        </HStack>
      </VStack>
    </ResponsiveModal>
  )
}
