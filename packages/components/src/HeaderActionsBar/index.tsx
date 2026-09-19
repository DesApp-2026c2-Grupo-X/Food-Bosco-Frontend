import { Box, HStack } from '@chakra-ui/react'
import { ColorModeButton } from '../ColorModeProvider/ColorModeButton'
import { ProfileIconLink } from '../ProfileIconLink'
import type { HeaderActionsBarProps } from './types'

export const HeaderActionsBar = ({ profilePath, children }: HeaderActionsBarProps) => (
  <HStack gap="1">
    {children}
    <Box display={{ base: 'none', md: 'block' }}>
      <ColorModeButton />
    </Box>
    <Box display={{ base: 'none', md: 'block' }}>
      <ProfileIconLink to={profilePath} />
    </Box>
  </HStack>
)
