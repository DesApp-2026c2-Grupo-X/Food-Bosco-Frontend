import { notifyError, StatusToggleButton } from '@repo/components'
import { useBranchStatus } from '@repo/api'

export const BranchStatusButton = () => {
  const { isOpen, isUpdating, toggle } = useBranchStatus()

  const handleToggle = () => {
    void toggle().catch(() => {
      notifyError({ title: 'No pudimos cambiar el estado de la sucursal' })
    })
  }

  return (
    <StatusToggleButton
      active={isOpen}
      onToggle={handleToggle}
      activeLabel="Abierto"
      inactiveLabel="Cerrado"
      colorPalette="success"
      disabled={isUpdating}
      disabledHint="Actualizando estado…"
    />
  )
}
