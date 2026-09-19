import { StatusToggleButton } from '@repo/components'
import { useBranchStatusStore } from '../../stores/branchStatusStore'

export const BranchStatusButton = () => {
  const isOpen = useBranchStatusStore((state) => state.isOpen)
  const toggle = useBranchStatusStore((state) => state.toggle)

  return (
    <StatusToggleButton
      active={isOpen}
      onToggle={toggle}
      activeLabel="Abierto"
      inactiveLabel="Cerrado"
      colorPalette="success"
    />
  )
}
