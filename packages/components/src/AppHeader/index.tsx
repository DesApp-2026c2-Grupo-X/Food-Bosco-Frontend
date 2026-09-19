import { Box, Container, Flex } from '@chakra-ui/react'
import { DesktopNav } from '../DesktopNav'
import type { AppHeaderProps } from './types'

export const AppHeader = ({ navItems, isActive, logo, actions, overlays }: AppHeaderProps) => (
  <Box
    as="header"
    bg="bg"
    borderBottom="1px"
    borderColor="border.subtle"
    pt="env(safe-area-inset-top)"
  >
    <Container maxW="containerContent">
      <Flex h="16" align="center" justify="space-between" gap="4">
        {logo}
        <DesktopNav items={navItems} isActive={isActive} />
        {actions}
      </Flex>
    </Container>
    {overlays}
  </Box>
)
