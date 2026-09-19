import { HStack, VStack } from '@chakra-ui/react'
import { GhostButton, PrimaryButton } from '../Button'
import { Muted } from '../Muted'
import { ResponsiveModal } from '../ResponsiveModal'
import { Strong } from '../Strong'
import type { ConfirmDeleteModalProps } from './types'

export const ConfirmDeleteModal = ({
  open,
  title,
  description,
  confirmLabel = 'Eliminar',
  isSubmitting,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) => (
  <ResponsiveModal open={open} onClose={onClose}>
    <VStack align="stretch" gap="4">
      <Strong fontSize="lg">{title}</Strong>
      <Muted>{description}</Muted>
      <HStack justify="end" gap="2">
        <GhostButton type="button" onClick={onClose}>
          Cancelar
        </GhostButton>
        <PrimaryButton size="md" loading={isSubmitting} onClick={onConfirm}>
          {confirmLabel}
        </PrimaryButton>
      </HStack>
    </VStack>
  </ResponsiveModal>
)
