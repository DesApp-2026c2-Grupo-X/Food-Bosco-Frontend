import { HStack } from '@chakra-ui/react'
import { GhostButton } from '../Button'
import { Muted } from '../Muted'
import { ToggleSwitch } from '../ToggleSwitch'
import type { RowEditToggleActionsProps } from './types'

export const RowEditToggleActions = ({
  onEdit,
  checked,
  onToggle,
  disabled,
  ariaLabel,
  extra,
  readOnlyText,
}: RowEditToggleActionsProps) => (
  <HStack gap="2" justify="end">
    {readOnlyText ? (
      <Muted fontSize="sm">{readOnlyText}</Muted>
    ) : (
      <>
        {onEdit ? (
          <GhostButton size="sm" onClick={onEdit}>
            Editar
          </GhostButton>
        ) : null}
        {extra}
        {onToggle ? (
          <ToggleSwitch
            checked={checked ?? false}
            onChange={onToggle}
            disabled={disabled}
            ariaLabel={ariaLabel}
          />
        ) : null}
      </>
    )}
  </HStack>
)
