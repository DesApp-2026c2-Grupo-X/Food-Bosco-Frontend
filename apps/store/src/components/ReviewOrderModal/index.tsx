import { useEffect, useState } from 'react'
import { Alert, Box, HStack, VStack } from '@chakra-ui/react'
import Person from '@gravity-ui/icons/Person'
import ShoppingBag from '@gravity-ui/icons/ShoppingBag'
import {
  Card,
  Muted,
  PrimaryButton,
  ResponsiveModal,
  SecondaryButton,
  StarRating,
  Strong,
  TextAreaField,
  notifyError,
  notifySuccess,
} from '@repo/components'
import { getApiErrorMessage, useCreateOrderReview } from '@repo/api'
import { REVIEW_COMMENT_MAX_LENGTH, ratingMessage } from '@repo/domain'
import type { ReviewOrderModalProps } from './types'

const commentLengthText = (value: string): string =>
  `${value.length}/${REVIEW_COMMENT_MAX_LENGTH}`

export const ReviewOrderModal = ({
  open,
  order,
  onClose,
  onSubmitted,
}: ReviewOrderModalProps) => {
  const { createReview, isLoading } = useCreateOrderReview()
  const [branchRating, setBranchRating] = useState(0)
  const [branchComment, setBranchComment] = useState('')
  const [courierRating, setCourierRating] = useState(0)
  const [courierComment, setCourierComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const hasCourier = Boolean(order.riderId)
  const courierName = order.rider
    ? [order.rider.firstName, order.rider.lastName].filter(Boolean).join(' ')
    : ''
  const busy = submitting || isLoading

  useEffect(() => {
    if (!open) return
    setBranchRating(0)
    setBranchComment('')
    setCourierRating(0)
    setCourierComment('')
    setError(null)
    setSubmitting(false)
  }, [open])

  const handleSubmit = async () => {
    if (busy) return

    if (branchRating < 1) {
      setError('Elegí una calificación para la sucursal.')
      return
    }
    if (hasCourier && courierRating < 1) {
      setError('Elegí una calificación para el repartidor.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await createReview({
        variables: {
          orderId: order.id,
          input: {
            branchRating,
            branchComment: branchComment.trim() || null,
            ...(hasCourier
              ? { courierRating, courierComment: courierComment.trim() || null }
              : {}),
          },
        },
      })
      notifySuccess({ title: '¡Gracias por tu opinión!' })
      onSubmitted?.()
      onClose()
    } catch (caught) {
      const message = getApiErrorMessage(caught)
      setError(message)
      notifyError({ title: 'No pudimos enviar tu calificación', description: message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ResponsiveModal open={open} onClose={onClose} closable={!busy}>
      <VStack align="stretch" gap="5">
        <Box>
          <Strong fontSize="xl">¿Cómo estuvo tu pedido?</Strong>
          <Muted fontSize="sm" marginTop="1">
            Tu opinión nos ayuda a mejorar la experiencia de Food-Bosco.
          </Muted>
        </Box>

        <Card variant="subtle">
          <HStack gap="3" marginBottom="4" align="center">
            <Box color="brand.500" display="flex">
              <ShoppingBag width={24} height={24} />
            </Box>
            <VStack align="start" gap="0">
              <Strong>{order.branch?.name ?? 'Sucursal'}</Strong>
              <Muted fontSize="sm">Calificá la preparación y el servicio</Muted>
            </VStack>
          </HStack>

          <StarRating
            value={branchRating}
            onChange={setBranchRating}
            size="lg"
            label="Calificación de la sucursal"
            disabled={busy}
          />
          <Muted fontSize="sm" marginTop="2" minHeight="1.25rem">
            {ratingMessage(branchRating)}
          </Muted>

          <Box marginTop="4">
            <TextAreaField
              label="Comentario sobre la sucursal (opcional)"
              placeholder="Contanos qué te gustó o qué podemos mejorar."
              value={branchComment}
              maxLength={REVIEW_COMMENT_MAX_LENGTH}
              disabled={busy}
              onChange={(event) => setBranchComment(event.target.value)}
            />
            <Muted fontSize="xs" textAlign="end" marginTop="1">
              {commentLengthText(branchComment)}
            </Muted>
          </Box>
        </Card>

        {hasCourier ? (
          <Card>
            <HStack gap="3" marginBottom="4" align="center">
              <Box color="brand.500" display="flex">
                <Person width={24} height={24} />
              </Box>
              <VStack align="start" gap="0">
                <Strong>{courierName || 'Tu repartidor'}</Strong>
                <Muted fontSize="sm">Calificá la entrega de tu pedido</Muted>
              </VStack>
            </HStack>

            <StarRating
              value={courierRating}
              onChange={setCourierRating}
              size="lg"
              label="Calificación del repartidor"
              disabled={busy}
            />
            <Muted fontSize="sm" marginTop="2" minHeight="1.25rem">
              {ratingMessage(courierRating)}
            </Muted>

            <Box marginTop="4">
              <TextAreaField
                label="Comentario sobre el repartidor (opcional)"
                placeholder="¿Llegó en tiempo y forma? Contanos."
                value={courierComment}
                maxLength={REVIEW_COMMENT_MAX_LENGTH}
                disabled={busy}
                onChange={(event) => setCourierComment(event.target.value)}
              />
              <Muted fontSize="xs" textAlign="end" marginTop="1">
                {commentLengthText(courierComment)}
              </Muted>
            </Box>
          </Card>
        ) : null}

        {error ? (
          <Alert.Root status="error" borderRadius="xl">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        ) : null}

        <VStack align="stretch" gap="2">
          <PrimaryButton
            type="button"
            width="full"
            onClick={handleSubmit}
            loading={busy}
            disabled={busy || branchRating < 1 || (hasCourier && courierRating < 1)}
          >
            Enviar calificación
          </PrimaryButton>
          <SecondaryButton type="button" width="full" onClick={onClose} disabled={busy}>
            Ahora no
          </SecondaryButton>
        </VStack>

        <Muted fontSize="xs" textAlign="center">
          Las calificaciones enviadas son definitivas.
        </Muted>
      </VStack>
    </ResponsiveModal>
  )
}
