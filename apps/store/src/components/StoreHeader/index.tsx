import { Box, Container, Flex, Link as ChakraLink, useDisclosure } from '@chakra-ui/react'
import { NavLink, useLocation } from 'react-router-dom'
import { routes } from '../../routes'
import { CartDrawer } from '../CartDrawer'
import { Logo } from '../Logo'
import { DesktopNav } from './DesktopNav'
import { HeaderActions } from './HeaderActions'
import { useStoreNavigation } from './hooks/useStoreNavigation'
import type { StoreHeaderProps } from './types'

const MOBILE_LOCATION_PATHS: string[] = [routes.home, routes.catalog, routes.cart]

export const StoreHeader = ({ onOpenLocation }: StoreHeaderProps) => {
  const { navItems, isActive } = useStoreNavigation()
  const cart = useDisclosure()
  const { pathname } = useLocation()
  const showMobileLocation = MOBILE_LOCATION_PATHS.includes(pathname)

  return (
    <Box as="header" bg="bg" borderBottom="1px" borderColor="border.subtle">
      <Container maxW="1200px">
        <Flex h="16" align="center" justify="space-between" gap="4">
          <ChakraLink asChild>
            <NavLink to={routes.home} aria-label="Ir al inicio">
              <Logo height="40px" />
            </NavLink>
          </ChakraLink>
          <DesktopNav items={navItems} isActive={isActive} />
          <HeaderActions
            onOpenCart={cart.onOpen}
            onOpenLocation={onOpenLocation}
            showMobileLocation={showMobileLocation}
          />
        </Flex>
      </Container>
      <CartDrawer open={cart.open} onClose={cart.onClose} />
    </Box>
  )
}
