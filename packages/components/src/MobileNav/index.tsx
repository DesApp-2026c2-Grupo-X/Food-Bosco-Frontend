import { Box, HStack } from '@chakra-ui/react'
import { matchPath, useLocation } from 'react-router-dom'
import { isNavItemActive } from '../navigation'
import { MobileNavItem } from './MobileNavItem'
import type { MobileNavProps } from './types'

export const MobileNav = ({ items, ariaLabel = 'Navegación principal' }: MobileNavProps) => {
  const { pathname } = useLocation()

  const isActive = (item: MobileNavProps['items'][number]) =>
    isNavItemActive(pathname, item.path, item.exact) ||
    (item.activePaths?.some((path) => matchPath(path, pathname) !== null) ?? false)

  return (
    <Box
      position="fixed"
      bottom="6"
      left="0"
      right="0"
      display={{ base: 'flex', md: 'none' }}
      justifyContent="center"
      paddingX="4"
      zIndex="docked"
      pointerEvents="none"
    >
      <HStack
        as="nav"
        gap="0"
        bg="bg.panel"
        borderRadius="full"
        padding="1"
        border="1px solid"
        borderColor="border.subtle"
        boxShadow="lg"
        pointerEvents="auto"
        aria-label={ariaLabel}
      >
        {items.map((item) => (
          <MobileNavItem key={item.id} item={item} isActive={isActive(item)} />
        ))}
      </HStack>
    </Box>
  )
}
