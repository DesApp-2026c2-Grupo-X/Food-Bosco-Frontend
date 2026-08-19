import { Box, Text } from '@chakra-ui/react'
import ChevronDown from '@gravity-ui/icons/ChevronDown'
import GeoPin from '@gravity-ui/icons/GeoPin'
import { GhostButton } from '@repo/components'
import { useAddresses } from '@repo/api'
import { useAddressStore } from '../../stores/addressStore'
import type { LocationButtonProps } from './types'

export const LocationButton = ({ onOpen }: LocationButtonProps) => {
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId)
  const { addresses } = useAddresses()
  const selected = addresses.find((address) => address.id === selectedAddressId)
  const label = selected ? selected.text : 'Elegí tu dirección'

  return (
    <GhostButton
      size="sm"
      height="9"
      gap="1.5"
      paddingX="3"
      onClick={onOpen}
      aria-label={`Dirección de entrega: ${label}`}
    >
      <Box color="brand.600" display="flex">
        <GeoPin width={16} height={16} />
      </Box>
      <Text fontSize="sm" fontWeight="medium" lineClamp={1} maxWidth={{ base: '36', md: '48' }}>
        {label}
      </Text>
      <Box color="fg.subtle" display="flex">
        <ChevronDown width={14} height={14} />
      </Box>
    </GhostButton>
  )
}
