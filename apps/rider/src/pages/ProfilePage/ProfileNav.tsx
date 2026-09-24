import { Box, Link as ChakraLink, Text, VStack } from '@chakra-ui/react'
import Car from '@gravity-ui/icons/Car'
import ChevronRight from '@gravity-ui/icons/ChevronRight'
import PencilToSquare from '@gravity-ui/icons/PencilToSquare'
import { NavLink } from 'react-router-dom'
import type { ComponentType, SVGProps } from 'react'
import { routes } from '../../routes'
import type { ProfileNavItem } from './types'

const ICON_BY_ID: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  edit: PencilToSquare,
  vehicle: Car,
}

const ACCOUNT_ITEMS: ProfileNavItem[] = [
  { id: 'edit', label: 'Editar perfil', path: routes.profileEdit },
  { id: 'vehicle', label: 'Vehículo', path: routes.profileVehicle },
]

export const ProfileNav = () => {
  return (
    <VStack align="stretch" gap="2" as="nav" aria-label="Opciones de cuenta">
      {ACCOUNT_ITEMS.map((item) => {
        const IconComponent = ICON_BY_ID[item.id] ?? PencilToSquare
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
