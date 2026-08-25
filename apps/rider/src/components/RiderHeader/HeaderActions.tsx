import { Box, Link as ChakraLink, HStack } from '@chakra-ui/react'
import Person from '@gravity-ui/icons/Person'
import { NavLink } from 'react-router-dom'
import { ColorModeButton } from '@repo/components'
import { routes } from '../../routes'
import { RideStatusButton } from '../RideStatusButton'

export const HeaderActions = () => {
  return (
    <HStack gap="1">
      <Box>
        <RideStatusButton />
      </Box>
      <Box display={{ base: 'none', md: 'block' }}>
        <ColorModeButton />
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
