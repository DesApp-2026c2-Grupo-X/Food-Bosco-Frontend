import { HStack } from '@chakra-ui/react'
import { NavItem } from '../NavItem'
import type { DesktopNavProps } from './types'

export const DesktopNav = ({ items, isActive }: DesktopNavProps) => {
  return (
    <HStack as="nav" gap="1" display={{ base: 'none', md: 'flex' }}>
      {items.map((item) => (
        <NavItem key={item.id} to={item.path} label={item.label} active={isActive(item.path)} />
      ))}
    </HStack>
  )
}
