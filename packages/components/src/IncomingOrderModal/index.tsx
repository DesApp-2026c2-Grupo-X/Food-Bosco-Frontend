import { useEffect } from 'react'
import { HStack, VStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { formatPrice } from '@repo/domain'
import { playIncomingSound, stopIncomingSound } from '../AudioUnlock/playIncomingSound'
import { GhostButton, PrimaryButton } from '../Button'
import { Card } from '../Card'
import { ResponsiveModal } from '../ResponsiveModal'
import { Muted, Strong } from '../typography'
import type { IncomingOrderModalProps } from './types'

export const IncomingOrderModal = ({
  order,
  onClose,
  orderDetailPath,
}: IncomingOrderModalProps) => {
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

  const itemCount = order?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <ResponsiveModal open={order !== null} onClose={onClose}>
      <VStack align="stretch" gap="4">
        <VStack align="start" gap="1">
          <Strong fontSize="xl">Nuevo pedido #{order?.number}</Strong>
          <Muted>Llegó un pedido a tu sucursal.</Muted>
        </VStack>
        {order ? (
          <Card
            variant="subtle"
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            gap="1"
            borderRadius="xl"
            padding="4"
          >
            <Strong>
              {order.client ? `${order.client.firstName} ${order.client.lastName}` : '—'}
            </Strong>
            <Muted fontSize="sm">{order.deliveryAddress.text}</Muted>
            <Muted fontSize="sm">
              {itemCount} {itemCount === 1 ? 'ítem' : 'ítems'} · {formatPrice(order.total)}
            </Muted>
          </Card>
        ) : null}
        <HStack justify="end" gap="2">
          <GhostButton onClick={onClose}>Después</GhostButton>
          <PrimaryButton onClick={handleView}>Ver pedido</PrimaryButton>
        </HStack>
      </VStack>
    </ResponsiveModal>
  )
}
