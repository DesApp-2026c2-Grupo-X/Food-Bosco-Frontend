import { Box } from '@chakra-ui/react'
import { HeaderActionsBar } from '@repo/components'
import { useAddresses } from '@repo/api'
import { routes } from '../../routes'
import { useAddressStore } from '../../stores/addressStore'
import { CartButton } from '../CartButton'
import { LocationButton } from '../LocationButton'

interface HeaderActionsProps {
  count: number
  onOpenCart: () => void
  onOpenLocation: () => void
  showMobileLocation: boolean
}

export const HeaderActions = ({
  count,
  onOpenCart,
  onOpenLocation,
  showMobileLocation,
}: HeaderActionsProps) => {
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId)
  const { addresses } = useAddresses()
  const selected = addresses.find((address) => address.id === selectedAddressId)
  const label = selected ? selected.text : 'Elegí tu dirección'

  return (
    <HeaderActionsBar profilePath={routes.profile}>
      <Box display={{ base: showMobileLocation ? 'block' : 'none', md: 'block' }}>
        <LocationButton label={label} onOpen={onOpenLocation} />
      </Box>
      <Box display={{ base: 'none', md: 'block' }}>
        <CartButton count={count} onClick={onOpenCart} />
      </Box>
    </HeaderActionsBar>
  )
}
