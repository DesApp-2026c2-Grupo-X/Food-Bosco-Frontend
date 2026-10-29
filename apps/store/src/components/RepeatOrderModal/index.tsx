import { Box, HStack, VStack } from '@chakra-ui/react'
import ArrowRotateLeft from '@gravity-ui/icons/ArrowRotateLeft'
import CircleCheckFill from '@gravity-ui/icons/CircleCheckFill'
import TriangleExclamation from '@gravity-ui/icons/TriangleExclamation'
import {
  GhostButton,
  Muted,
  PrimaryButton,
  ResponsiveModal,
  SecondaryButton,
  Strong,
} from '@repo/components'
import { formatPrice, type RepeatSkippedItem } from '@repo/domain'
import { useRepeatOrderAction } from './hooks/useRepeatOrderAction'
import { repeatSkipReasonLabel } from './utils/repeatSkipReasonLabel'
import type { RepeatOrderModalProps } from './types'

export const RepeatOrderModal = ({ order, onClose }: RepeatOrderModalProps) => {
  const {
    stage,
    result,
    error,
    isLoading,
    isCartLoading,
    activeCartItemCount,
    confirm,
    retry,
    goToCart,
    dismiss,
  } = useRepeatOrderAction({ order, onClose })

  const itemCount = order.items.reduce((count, item) => count + item.quantity, 0)
  const cartIsEmpty = result != null && result.cart.items.length === 0

  return (
    <ResponsiveModal open onClose={onClose} closable={!isLoading}>
      {stage === 'confirm' ? (
        <VStack align="stretch" gap="5">
          <HStack gap="3" align="start">
            <Box bg="bg.muted" color="brand.600" borderRadius="full" padding="3">
              <ArrowRotateLeft width={22} height={22} />
            </Box>
            <VStack align="start" gap="1">
              <Strong fontSize="xl">¿Querés repetir este pedido?</Strong>
              <Muted fontSize="sm">
                Pedido #{order.number} · {itemCount} {itemCount === 1 ? 'ítem' : 'ítems'}
              </Muted>
            </VStack>
          </HStack>

          <Muted fontSize="sm">
            Se creará un carrito nuevo con los productos que continúen disponibles. Los precios se
            recalculan con el catálogo actual y el stock se valida al confirmar el pedido.
          </Muted>

          {!isCartLoading && activeCartItemCount > 0 ? (
            <Box
              bg="bg.subtle"
              border="1px solid"
              borderColor="border.emphasized"
              borderRadius="xl"
              padding="4"
            >
              <HStack gap="3" align="start">
                <Box color="warning" flexShrink="0">
                  <TriangleExclamation width={20} height={20} />
                </Box>
                <Muted fontSize="sm">
                  Tu carrito actual tiene {activeCartItemCount}{' '}
                  {activeCartItemCount === 1 ? 'ítem' : 'ítems'} y será reemplazado por los
                  productos de este pedido.
                </Muted>
              </HStack>
            </Box>
          ) : null}

          <HStack justify="end" gap="2" wrap="wrap">
            <GhostButton type="button" onClick={dismiss} disabled={isLoading}>
              Cancelar
            </GhostButton>
            <PrimaryButton type="button" loading={isLoading} onClick={confirm}>
              Repetir pedido
            </PrimaryButton>
          </HStack>
        </VStack>
      ) : null}

      {stage === 'result' && isLoading ? (
        <VStack align="stretch" gap="4">
          <Strong fontSize="xl">Repitiendo tu pedido</Strong>
          <Muted fontSize="sm">
            Estamos verificando la disponibilidad de los productos y los precios actuales.
          </Muted>
        </VStack>
      ) : null}

      {stage === 'result' && !isLoading && error ? (
        <VStack align="stretch" gap="5">
          <HStack gap="3" align="start">
            <Box color="danger" flexShrink="0">
              <TriangleExclamation width={24} height={24} />
            </Box>
            <VStack align="start" gap="1">
              <Strong fontSize="xl">No pudimos repetir el pedido</Strong>
              <Muted fontSize="sm">{error}</Muted>
            </VStack>
          </HStack>
          <HStack justify="end" gap="2" wrap="wrap">
            <GhostButton type="button" onClick={dismiss}>
              Cerrar
            </GhostButton>
            <PrimaryButton type="button" onClick={retry}>
              Reintentar
            </PrimaryButton>
          </HStack>
        </VStack>
      ) : null}

      {stage === 'result' && !isLoading && !error && result && cartIsEmpty ? (
        <VStack align="stretch" gap="5">
          <HStack gap="3" align="start">
            <Box color="warning" flexShrink="0">
              <TriangleExclamation width={24} height={24} />
            </Box>
            <VStack align="start" gap="1">
              <Strong fontSize="xl">No se pudo generar el carrito</Strong>
              <Muted fontSize="sm">
                Ninguno de los productos de este pedido está disponible en este momento.
              </Muted>
            </VStack>
          </HStack>

          <SkippedItemsList items={result.skippedItems} />

          <HStack justify="end">
            <SecondaryButton type="button" onClick={dismiss}>
              Cerrar
            </SecondaryButton>
          </HStack>
        </VStack>
      ) : null}

      {stage === 'result' && !isLoading && !error && result && !cartIsEmpty ? (
        <VStack align="stretch" gap="5">
          <HStack gap="3" align="start">
            <Box color="success" flexShrink="0">
              <CircleCheckFill width={24} height={24} />
            </Box>
            <VStack align="start" gap="1">
              <Strong fontSize="xl">Carrito actualizado</Strong>
              <Muted fontSize="sm">
                Revisá los productos agregados y los cambios detectados antes de confirmar.
              </Muted>
            </VStack>
          </HStack>

          <SkippedItemsList items={result.skippedItems} />

          {result.priceChanges.length > 0 ? (
            <VStack align="stretch" gap="3">
              <Strong fontSize="sm">Precios actualizados</Strong>
              {result.priceChanges.map((change, index) => (
                <HStack
                  key={`${change.productId}-${index}`}
                  justify="space-between"
                  gap="3"
                  align="start"
                >
                  <VStack align="start" gap="0">
                    <Strong fontSize="sm">
                      {change.quantity} × {change.name}
                    </Strong>
                    <Muted fontSize="xs">Precio por unidad</Muted>
                  </VStack>
                  <HStack gap="2">
                    <Muted fontSize="sm" textDecoration="line-through">
                      {formatPrice(change.previousUnitPrice)}
                    </Muted>
                    <Strong fontSize="sm">{formatPrice(change.currentUnitPrice)}</Strong>
                  </HStack>
                </HStack>
              ))}
            </VStack>
          ) : null}

          <HStack justify="end" gap="2" wrap="wrap">
            <GhostButton type="button" onClick={dismiss}>
              Seguir revisando
            </GhostButton>
            <PrimaryButton type="button" onClick={goToCart}>
              Ir al carrito
            </PrimaryButton>
          </HStack>
        </VStack>
      ) : null}
    </ResponsiveModal>
  )
}

const SkippedItemsList = ({ items }: { items: RepeatSkippedItem[] }) => {
  if (items.length === 0) return null

  return (
    <VStack align="stretch" gap="3">
      <Strong fontSize="sm">No pudimos agregar</Strong>
      {items.map((item, index) => (
        <HStack
          key={`${item.productId}-${item.reason}-${index}`}
          justify="space-between"
          gap="3"
          align="start"
        >
          <Strong fontSize="sm">{item.name}</Strong>
          <Muted fontSize="xs" textAlign="right">
            {repeatSkipReasonLabel(item.reason)}
          </Muted>
        </HStack>
      ))}
    </VStack>
  )
}
