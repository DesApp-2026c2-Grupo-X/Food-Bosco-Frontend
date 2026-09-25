import { Box } from '@chakra-ui/react'
import { HeaderActionsBar } from '@repo/components'
import { routes } from '../../routes'
import { RideStatusButton } from '../RideStatusButton'

export const HeaderActions = () => (
  <HeaderActionsBar profilePath={routes.profile}>
    <Box>
      <RideStatusButton />
    </Box>
  </HeaderActionsBar>
)
