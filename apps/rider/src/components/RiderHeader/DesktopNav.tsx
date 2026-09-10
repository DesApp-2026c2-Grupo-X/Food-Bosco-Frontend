import { Link as ChakraLink, HStack } from '@chakra-ui/react'
import { NavLink } from 'react-router-dom'
import type { NavItem } from './types'

interface DesktopNavProps {
  items: NavItem[]
  isActive: (path: string) => boolean
}

export const DesktopNav = ({ items, isActive }: DesktopNavProps) => {
  return (
    <HStack as="nav" gap="1" display={{ base: 'none', md: 'flex' }}>
      {items.map((item) => {
        const active = isActive(item.path)
        return (
          <ChakraLink
            asChild
            key={item.id}
            paddingX="4"
            paddingY="2"
            borderRadius="full"
            fontWeight={active ? 'semibold' : 'medium'}
            color={active ? 'white' : 'fg.muted'}
            bg={active ? 'brand.500' : 'transparent'}
            _hover={{
              color: active ? 'white' : 'brand.600',
              bg: active ? 'brand.500' : 'bg.muted',
            }}
            transition="background-color 150ms, color 150ms"
          >
            <NavLink to={item.path}>{item.label}</NavLink>
          </ChakraLink>
        )
      })}
    </HStack>
  )
}
