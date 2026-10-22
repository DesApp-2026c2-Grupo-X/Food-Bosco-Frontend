import { StatusToggleButton } from '@repo/components'
import { useRideAvailability } from '../../hooks/useRideAvailability'

export const RideStatusButton = () => {
  const { available, onToggle, locked } = useRideAvailability()

  return (
    <StatusToggleButton
      active={available}
      onToggle={onToggle}
      activeLabel="Conectado"
      inactiveLabel="Desconectado"
      statusColor="brand.600"
      disabled={locked}
      disabledHint="No podés desconectarte con un viaje en curso"
    />
  )
}
