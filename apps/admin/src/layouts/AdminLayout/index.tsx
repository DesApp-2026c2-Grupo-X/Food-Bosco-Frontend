import {
  Box,
  Container,
  Flex,
  HStack,
  IconButton,
  Link as ChakraLink,
  Text,
  VStack,
} from '@chakra-ui/react'
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerPositioner,
  DrawerRoot,
  DrawerTitle,
  Portal,
  useDisclosure,
} from '@chakra-ui/react'
import Bars from '@gravity-ui/icons/Bars'
import ArrowRightFromSquare from '@gravity-ui/icons/ArrowRightFromSquare'
import Person from '@gravity-ui/icons/Person'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ColorModeButton } from '@repo/components'
import { MOCK_SUPER_ADMIN, useAuthStore } from '@repo/api'
import { authRoutes } from '@repo/auth'
import { Logo } from '../../components/Logo'
import { routes } from '../../routes'
import { navSections } from './utils/navigation'
import type { AdminNavItem } from './types'

const isItemActive = (pathname: string, item: AdminNavItem) =>
  item.exact ? pathname === item.path : pathname.startsWith(item.path)

export const AdminLayout = () => {
  const { open, onOpen, onClose } = useDisclosure()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user) ?? MOCK_SUPER_ADMIN

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()

  const handleLogout = () => {
    logout()
    navigate(authRoutes.login)
  }

  const profileActive = pathname.startsWith(routes.profile)

  const renderItem = (item: AdminNavItem, onNavigate?: () => void) => {
    const active = isItemActive(pathname, item)
    const Icon = item.icon
    return (
      <ChakraLink
        asChild
        key={item.id}
        display="flex"
        alignItems="center"
        gap="3"
        paddingX="3"
        paddingY="2.5"
        borderRadius="full"
        color={active ? 'brand.700' : 'fg.muted'}
        bg={active ? 'bg.muted' : 'transparent'}
        _hover={{ color: 'brand.600', bg: 'bg.muted' }}
        fontWeight={active ? 'semibold' : 'normal'}
      >
        <NavLink to={item.path} onClick={onNavigate}>
          <Icon width={20} height={20} />
          {item.label}
        </NavLink>
      </ChakraLink>
    )
  }

  return (
    <Flex minH="100vh" bg="bg">
      <Box
        as="aside"
        display={{ base: 'none', md: 'flex' }}
        flexDirection="column"
        width="64"
        borderRight="1px solid"
        borderColor="border.subtle"
        position="sticky"
        top="0"
        height="100vh"
        bg="bg.panel"
        overflowY="auto"
      >
        <VStack align="start" gap="1" paddingX="6" paddingY="6">
          <Logo height="36px" />
          <Text color="fg.muted" fontSize="sm">
            Administrador global
          </Text>
        </VStack>

        <VStack as="nav" align="stretch" gap="4" paddingX="3" paddingBottom="6">
          {navSections.map((section) => (
            <VStack key={section.id} align="stretch" gap="1">
              <Text
                color="fg.subtle"
                fontSize="xs"
                fontWeight="semibold"
                textTransform="uppercase"
                letterSpacing="0.05em"
                paddingX="3"
                marginBottom="1"
              >
                {section.label}
              </Text>
              {section.items.map((item) => renderItem(item))}
            </VStack>
          ))}
        </VStack>

        <Box marginTop="auto" paddingX="3" paddingBottom="6">
          <VStack align="stretch" gap="1">
            <ChakraLink
              asChild
              display="flex"
              alignItems="center"
              gap="3"
              paddingX="3"
              paddingY="2.5"
              borderRadius="full"
              color={profileActive ? 'brand.700' : 'fg.muted'}
              bg={profileActive ? 'bg.muted' : 'transparent'}
              _hover={{ color: 'brand.600', bg: 'bg.muted' }}
              fontWeight={profileActive ? 'semibold' : 'normal'}
            >
              <NavLink to={routes.profile}>
                <Person width={20} height={20} />
                Mi perfil
              </NavLink>
            </ChakraLink>
            <ChakraLink
              asChild
              display="flex"
              alignItems="center"
              gap="3"
              paddingX="3"
              paddingY="2.5"
              borderRadius="full"
              color="fg.muted"
              _hover={{ bg: 'bg.muted' }}
              onClick={handleLogout}
            >
              <NavLink to={authRoutes.login}>
                <ArrowRightFromSquare width={20} height={20} />
                Salir
              </NavLink>
            </ChakraLink>
          </VStack>
        </Box>
      </Box>

      <Flex flexDirection="column" flex="1" minWidth="0">
        <Flex
          as="header"
          height="16"
          align="center"
          justify="space-between"
          gap="4"
          paddingX={{ base: '4', md: '6' }}
          borderBottom="1px solid"
          borderColor="border.subtle"
          bg="bg.panel"
        >
          <HStack gap="3">
            <IconButton
              aria-label="Abrir menú"
              variant="ghost"
              display={{ base: 'inline-flex', md: 'none' }}
              onClick={onOpen}
            >
              <Bars width={22} height={22} />
            </IconButton>
            <Box display={{ base: 'block', md: 'none' }}>
              <Logo height="28px" />
            </Box>
            <Text fontWeight="semibold" display={{ base: 'none', md: 'block' }}>
              Administración
            </Text>
          </HStack>
          <HStack gap="2">
            <ChakraLink
              asChild
              display="flex"
              alignItems="center"
              gap="2"
              paddingX="2"
              paddingY="1.5"
              borderRadius="full"
              color="fg.muted"
              _hover={{ bg: 'bg.muted', color: 'fg' }}
            >
              <NavLink to={routes.profile}>
                <Box
                  width="7"
                  height="7"
                  borderRadius="full"
                  bg="brand.600"
                  color="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="xs"
                  fontWeight="bold"
                >
                  {initials}
                </Box>
                <Text fontWeight="medium" display={{ base: 'none', lg: 'block' }}>
                  {user.firstName} {user.lastName}
                </Text>
              </NavLink>
            </ChakraLink>
            <ColorModeButton />
          </HStack>
        </Flex>

        <Container as="main" maxW="1200px" paddingY={{ base: '6', md: '10' }}>
          <Outlet />
        </Container>
      </Flex>

      <DrawerRoot
        open={open}
        onOpenChange={(details) => !details.open && onClose()}
        placement="start"
      >
        <Portal>
          <DrawerBackdrop />
          <DrawerPositioner>
            <DrawerContent maxW="xs" bg="bg.panel">
              <DrawerHeader>
                <DrawerTitle>
                  <Logo height="30px" />
                </DrawerTitle>
                <DrawerCloseTrigger />
              </DrawerHeader>
              <DrawerBody>
                <VStack as="nav" align="stretch" gap="4">
                  {navSections.map((section) => (
                    <VStack key={section.id} align="stretch" gap="1">
                      <Text
                        color="fg.subtle"
                        fontSize="xs"
                        fontWeight="semibold"
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                        paddingX="3"
                        marginBottom="1"
                      >
                        {section.label}
                      </Text>
                      {section.items.map((item) => renderItem(item, onClose))}
                    </VStack>
                  ))}
                  <ChakraLink
                    asChild
                    display="flex"
                    alignItems="center"
                    gap="3"
                    paddingX="3"
                    paddingY="3"
                    borderRadius="full"
                    color={profileActive ? 'brand.700' : 'fg.muted'}
                    bg={profileActive ? 'bg.muted' : 'transparent'}
                    _hover={{ color: 'brand.600', bg: 'bg.muted' }}
                    onClick={onClose}
                  >
                    <NavLink to={routes.profile}>
                      <Person width={20} height={20} />
                      Mi perfil
                    </NavLink>
                  </ChakraLink>
                  <ChakraLink
                    asChild
                    display="flex"
                    alignItems="center"
                    gap="3"
                    paddingX="3"
                    paddingY="3"
                    borderRadius="full"
                    color="fg.muted"
                    onClick={handleLogout}
                  >
                    <NavLink to={authRoutes.login}>
                      <ArrowRightFromSquare width={20} height={20} />
                      Salir
                    </NavLink>
                  </ChakraLink>
                </VStack>
              </DrawerBody>
            </DrawerContent>
          </DrawerPositioner>
        </Portal>
      </DrawerRoot>
    </Flex>
  )
}
