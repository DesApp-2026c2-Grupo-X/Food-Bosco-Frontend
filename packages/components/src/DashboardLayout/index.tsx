import {
  Box,
  Container,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerPositioner,
  DrawerRoot,
  DrawerTitle,
  Flex,
  HStack,
  IconButton,
  Link as ChakraLink,
  Portal,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import ArrowRightFromSquare from '@gravity-ui/icons/ArrowRightFromSquare'
import Bars from '@gravity-ui/icons/Bars'
import { useLocation } from 'react-router-dom'
import { ColorModeButton } from '../ColorModeProvider/ColorModeButton'
import { NavItem } from '../NavItem'
import { isNavItemActive } from '../navigation'
import type { DashboardLayoutProps, DashboardNavItem } from './types'

export const DashboardLayout = ({
  navSections,
  logo: Logo,
  brandSubtitle,
  headerTitle,
  sidebarScrollable = false,
  sidebarFooter,
  mobileItemPaddingY = '3',
  onLogout,
  headerActions,
  extras,
  children,
}: DashboardLayoutProps) => {
  const { open, onOpen, onClose } = useDisclosure()
  const { pathname } = useLocation()

  const renderItem = (item: DashboardNavItem, paddingY: string, onNavigate?: () => void) => {
    const active = isNavItemActive(pathname, item.path, item.exact)
    const Icon = item.icon
    return (
      <NavItem
        key={item.id}
        to={item.path}
        label={item.label}
        active={active}
        icon={<Icon width={20} height={20} />}
        variant="sidebar"
        paddingY={paddingY}
        onClick={onNavigate}
      />
    )
  }

  const renderSections = (paddingY: string, onNavigate?: () => void) => (
    <VStack align="stretch" gap="4">
      {navSections.map((section) => (
        <VStack key={section.id} align="stretch" gap="1">
          {section.label ? (
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
          ) : null}
          {section.items.map((item) => renderItem(item, paddingY, onNavigate))}
        </VStack>
      ))}
    </VStack>
  )

  const renderLogout = (paddingY: string, onNavigate?: () => void) => (
    <ChakraLink
      onClick={() => {
        onNavigate?.()
        onLogout()
      }}
      display="flex"
      alignItems="center"
      gap="3"
      paddingX="3"
      paddingY={paddingY}
      borderRadius="full"
      color="fg.muted"
      textDecoration="none"
      _hover={{ bg: 'bg.muted', textDecoration: 'none' }}
    >
      <ArrowRightFromSquare width={20} height={20} />
      Salir
    </ChakraLink>
  )

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
        overflowY={sidebarScrollable ? 'auto' : undefined}
      >
        <VStack align="start" gap="1" paddingX="6" paddingY="6">
          <Logo height="36px" />
          <Text color="fg.muted" fontSize="sm">
            {brandSubtitle}
          </Text>
        </VStack>

        <VStack as="nav" align="stretch" gap="4" paddingX="3" paddingBottom="6">
          {renderSections('2.5')}
        </VStack>

        <Box marginTop="auto" paddingX="3" paddingBottom="6">
          <VStack align="stretch" gap="1">
            {sidebarFooter}
            {renderLogout('2.5')}
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
              {headerTitle}
            </Text>
          </HStack>
          <HStack gap="2">
            {headerActions}
            <ColorModeButton />
          </HStack>
        </Flex>

        <Container as="main" maxW="containerContent" paddingY={{ base: '6', md: '10' }}>
          {children}
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
                  {renderSections(mobileItemPaddingY, onClose)}
                  {sidebarFooter ? <Box onClick={onClose}>{sidebarFooter}</Box> : null}
                  {renderLogout('3', onClose)}
                </VStack>
              </DrawerBody>
            </DrawerContent>
          </DrawerPositioner>
        </Portal>
      </DrawerRoot>

      {extras}
    </Flex>
  )
}
