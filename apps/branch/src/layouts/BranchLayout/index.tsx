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
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { ColorModeButton } from '@repo/components'
import { MOCK_BRANCH_NAME, useAuthStore, useIncomingOrder } from '@repo/api'
import { authRoutes } from '@repo/auth'
import { Logo } from '../../components/Logo'
import { BranchStatusButton } from '../../components/BranchStatusButton'
import { IncomingOrderModal } from '../../components/IncomingOrderModal'
import { unlockAudio } from '../../utils/playIncomingSound'
import { navItems } from './utils/navigation'
import type { BranchNavItem } from './types'

const isItemActive = (pathname: string, item: BranchNavItem) =>
  item.exact ? pathname === item.path : pathname.startsWith(item.path)

export const BranchLayout = () => {
  const { open, onOpen, onClose } = useDisclosure()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const { incoming, acknowledge } = useIncomingOrder()

  useEffect(() => {
    window.addEventListener('pointerdown', unlockAudio, { once: true })
    window.addEventListener('keydown', unlockAudio, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate(authRoutes.login)
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
      >
        <VStack align="start" gap="1" paddingX="6" paddingY="6">
          <Logo height="36px" />
          <Text color="fg.muted" fontSize="sm">
            {MOCK_BRANCH_NAME}
          </Text>
        </VStack>

        <VStack as="nav" align="stretch" gap="1" paddingX="3">
          {navItems.map((item) => {
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
                <NavLink to={item.path}>
                  <Icon width={20} height={20} />
                  {item.label}
                </NavLink>
              </ChakraLink>
            )
          })}
        </VStack>

        <Box marginTop="auto" paddingX="3" paddingBottom="6">
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
              Sucursal {MOCK_BRANCH_NAME}
            </Text>
          </HStack>
          <HStack gap="2">
            <BranchStatusButton />
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
                <VStack as="nav" align="stretch" gap="1">
                  {navItems.map((item) => {
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
                        paddingY="3"
                        borderRadius="full"
                        color={active ? 'brand.700' : 'fg.muted'}
                        bg={active ? 'bg.muted' : 'transparent'}
                        _hover={{ color: 'brand.600', bg: 'bg.muted' }}
                        fontWeight={active ? 'semibold' : 'normal'}
                        onClick={onClose}
                      >
                        <NavLink to={item.path}>
                          <Icon width={20} height={20} />
                          {item.label}
                        </NavLink>
                      </ChakraLink>
                    )
                  })}
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

      <IncomingOrderModal order={incoming} onClose={acknowledge} />
    </Flex>
  )
}
