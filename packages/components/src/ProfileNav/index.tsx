import { Box, Text, VStack } from '@chakra-ui/react'
import ChevronRight from '@gravity-ui/icons/ChevronRight'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Card } from '../Card'
import { Muted } from '../typography'
import type { ProfileNavItem, ProfileNavProps } from './types'

const renderBody = (item: ProfileNavItem, fallbackIcon: ReactNode, disabled: boolean) => (
  <Box display="flex" alignItems="center" justifyContent="space-between">
    <Box display="flex" alignItems="center" gap="3">
      <Box
        color={disabled ? 'fg.subtle' : 'brand.600'}
        bg="bg.muted"
        borderRadius="full"
        padding="2"
        display="flex"
      >
        {item.icon ?? fallbackIcon}
      </Box>
      <Box>
        <Text fontWeight="medium">{item.label}</Text>
        {disabled && item.hint ? <Muted fontSize="xs">{item.hint}</Muted> : null}
      </Box>
    </Box>
    {disabled ? null : (
      <Box color="fg.subtle" display="inline-flex">
        <ChevronRight width={18} height={18} />
      </Box>
    )}
  </Box>
)

export const ProfileNav = ({ items, fallbackIcon }: ProfileNavProps) => (
  <VStack align="stretch" gap="2" as="nav" aria-label="Opciones de cuenta">
    {items.map((item) =>
      item.disabled ? (
        <Card key={item.id} padding="3.5" opacity={0.6} aria-disabled>
          {renderBody(item, fallbackIcon, true)}
        </Card>
      ) : (
        <Card
          asChild
          interactive
          key={item.id}
          padding="3.5"
          textDecoration="none"
          _hover={{ textDecoration: 'none' }}
        >
          <NavLink to={item.path}>{renderBody(item, fallbackIcon, false)}</NavLink>
        </Card>
      ),
    )}
  </VStack>
)
