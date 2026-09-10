import { Box, Link as ChakraLink, HStack } from '@chakra-ui/react'
import Person from '@gravity-ui/icons/Person'
import { NavLink } from 'react-router-dom'
import { routes } from '../../routes'
import { CartButton } from '../CartButton'
import { ColorModeButton } from '@repo/components'
import { LocationButton } from '../LocationButton'

interface HeaderActionsProps {
  onOpenCart: () => void
  onOpenLocation: () => void
  showMobileLocation: boolean
}

export const HeaderActions = ({
  onOpenCart,
  onOpenLocation,
  showMobileLocation,
}: HeaderActionsProps) => {
  return (
    <HStack gap="1">
      <Box display={{ base: showMobileLocation ? 'block' : 'none', md: 'block' }}>
        <LocationButton onOpen={onOpenLocation} />
      </Box>
      <Box display={{ base: 'none', md: 'block' }}>
        <ColorModeButton />
      </Box>
      <Box display={{ base: 'none', md: 'block' }}>
        <CartButton onClick={onOpenCart} />
      </Box>
      <ChakraLink
        asChild
        display={{ base: 'none', md: 'flex' }}
        aria-label="Perfil"
        padding="2"
        borderRadius="full"
        color="fg.muted"
        _hover={{ color: 'fg', bg: 'bg.muted' }}
      >
        <NavLink to={routes.profile}>
          <Person width={20} height={20} />
        </NavLink>
      </ChakraLink>
    </HStack>
  )
}
