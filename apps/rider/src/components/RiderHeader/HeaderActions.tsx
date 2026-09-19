import { Box, HStack } from '@chakra-ui/react'
import { ColorModeButton, ProfileIconLink } from '@repo/components'
import { routes } from '../../routes'
import { RideStatusButton } from '../RideStatusButton'

export const HeaderActions = () => {
  return (
    <HStack gap="1">
      <Box>
        <RideStatusButton />
      </Box>
      <Box display={{ base: 'none', md: 'block' }}>
        <ColorModeButton />
      </Box>
      <Box display={{ base: 'none', md: 'block' }}>
        <ProfileIconLink to={routes.profile} />
      </Box>
    </HStack>
  )
}
