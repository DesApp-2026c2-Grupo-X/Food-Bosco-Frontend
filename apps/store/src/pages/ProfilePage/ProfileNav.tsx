import { Box, Link as ChakraLink, Text, VStack } from '@chakra-ui/react'
import ChevronRight from '@gravity-ui/icons/ChevronRight'
import GeoPin from '@gravity-ui/icons/GeoPin'
import House from '@gravity-ui/icons/House'
import PencilToSquare from '@gravity-ui/icons/PencilToSquare'
import { NavLink } from 'react-router-dom'
import { routes } from '../../routes'
import type { ComponentType, SVGProps } from 'react'
import type { ProfileNavItem } from './types'

const ICON_BY_ID: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  edit: PencilToSquare,
  addresses: GeoPin,
  branches: House,
}

const ACCOUNT_ITEMS: ProfileNavItem[] = [
  { id: 'edit', label: 'Editar perfil', path: routes.profileEdit },
  { id: 'addresses', label: 'Mis direcciones', path: routes.profileAddresses },
  { id: 'branches', label: 'Sucursales', path: routes.branches },
]

export const ProfileNav = () => {
  return (
    <VStack align="stretch" gap="2" as="nav" aria-label="Opciones de cuenta">
      {ACCOUNT_ITEMS.map((item) => {
        const IconComponent = ICON_BY_ID[item.id] ?? House
        return (
          <ChakraLink
            asChild
            key={item.id}
            bg="bg.panel"
            border="1px solid"
            borderColor="border.subtle"
            borderRadius="2xl"
            padding="3.5"
            _hover={{ borderColor: 'border.emphasized' }}
          >
            <NavLink to={item.path}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap="3">
                  <Box
                    color="brand.600"
                    bg="bg.muted"
                    borderRadius="full"
                    padding="2"
                    display="flex"
                  >
                    <IconComponent width={18} height={18} />
                  </Box>
                  <Text fontWeight="medium">{item.label}</Text>
                </Box>
                <Box color="fg.subtle" display="inline-flex">
                  <ChevronRight width={18} height={18} />
                </Box>
              </Box>
            </NavLink>
          </ChakraLink>
        )
      })}
    </VStack>
  )
}
