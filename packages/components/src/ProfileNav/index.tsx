import { Box, Text, VStack } from '@chakra-ui/react'
import ChevronRight from '@gravity-ui/icons/ChevronRight'
import { NavLink } from 'react-router-dom'
import { Card } from '../Card'
import type { ProfileNavProps } from './types'

export const ProfileNav = ({ items, fallbackIcon }: ProfileNavProps) => (
  <VStack align="stretch" gap="2" as="nav" aria-label="Opciones de cuenta">
    {items.map((item) => (
      <Card asChild interactive key={item.id} padding="3.5">
        <NavLink to={item.path}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap="3">
              <Box color="brand.600" bg="bg.muted" borderRadius="full" padding="2" display="flex">
                {item.icon ?? fallbackIcon}
              </Box>
              <Text fontWeight="medium">{item.label}</Text>
            </Box>
            <Box color="fg.subtle" display="inline-flex">
              <ChevronRight width={18} height={18} />
            </Box>
          </Box>
        </NavLink>
      </Card>
    ))}
  </VStack>
)
