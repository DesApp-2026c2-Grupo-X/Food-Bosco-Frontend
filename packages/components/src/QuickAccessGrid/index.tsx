import { Box, SimpleGrid } from '@chakra-ui/react'
import { MenuLink } from '../MenuLink'
import { Muted, Strong } from '../typography'
import type { QuickAccessGridProps } from './types'

export const QuickAccessGrid = ({ items, columns = { base: 2, md: 4 } }: QuickAccessGridProps) => (
  <SimpleGrid columns={columns} gap="4">
    {items.map((item) => {
      const Icon = item.icon
      return (
        <MenuLink
          key={item.id}
          to={item.path}
          display="block"
          bg="bg.panel"
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="2xl"
          padding="5"
          _hover={{ borderColor: 'border.emphasized' }}
        >
          <Box color="brand.600" marginBottom="3">
            <Icon width={26} height={26} />
          </Box>
          <Strong>{item.label}</Strong>
          <Muted fontSize="sm">{item.description}</Muted>
        </MenuLink>
      )
    })}
  </SimpleGrid>
)
