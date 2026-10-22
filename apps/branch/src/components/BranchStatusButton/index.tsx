import { notifyError, StatusToggleButton } from '@repo/components'
import { getApiErrorMessage, useBranchStatus } from '@repo/api'

export const BranchStatusButton = () => {
  const { isOpen, isUpdating, toggle } = useBranchStatus()

  const handleToggle = () => {
    void toggle().catch((caught) => {
      notifyError({
        title: 'No pudimos cambiar el estado de la sucursal',
        description: getApiErrorMessage(caught),
      })
    })
  }

  return (
    <StatusToggleButton
      active={isOpen}
      onToggle={handleToggle}
      activeLabel="Abierto"
      inactiveLabel="Cerrado"
      statusColor="success"
      disabled={isUpdating}
      disabledHint="Actualizando estado…"
    />
  )
}
