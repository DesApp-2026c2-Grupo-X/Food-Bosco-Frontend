import { HStack } from '@chakra-ui/react'
import { GhostButton, PrimaryButton } from '../Button'
import type { FormActionsProps } from './types'

export const FormActions = ({
  onCancel,
  submitLabel,
  isSubmitting = false,
  disabled,
  cancelLabel = 'Cancelar',
  cancelDisabled,
}: FormActionsProps) => (
  <HStack justify="end" gap="2">
    <GhostButton type="button" onClick={onCancel} disabled={cancelDisabled}>
      {cancelLabel}
    </GhostButton>
    <PrimaryButton
      type="submit"
      size="md"
      disabled={disabled === true || isSubmitting}
      loading={isSubmitting}
    >
      {submitLabel}
    </PrimaryButton>
  </HStack>
)
