import { Box, Container, Flex, Link as ChakraLink } from '@chakra-ui/react'
import { NavLink } from 'react-router-dom'
import { routes } from '../../routes'
import { Logo } from '../Logo'
import { DesktopNav } from './DesktopNav'
import { HeaderActions } from './HeaderActions'
import { useRiderNavigation } from './hooks/useRiderNavigation'

export const RiderHeader = () => {
  const { navItems, isActive } = useRiderNavigation()

  return (
    <Box
      as="header"
      bg="bg"
      borderBottom="1px"
      borderColor="border.subtle"
      pt="env(safe-area-inset-top)"
    >
      <Container maxW="1200px">
        <Flex h="16" align="center" justify="space-between" gap="4">
          <ChakraLink asChild>
            <NavLink to={routes.home} aria-label="Ir al inicio">
              <Logo height="40px" />
            </NavLink>
          </ChakraLink>
          <DesktopNav items={navItems} isActive={isActive} />
          <HeaderActions />
        </Flex>
      </Container>
    </Box>
  )
}
