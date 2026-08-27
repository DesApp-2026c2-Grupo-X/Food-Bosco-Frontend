import { Box, Container } from '@chakra-ui/react'
import { Outlet, matchPath, useLocation } from 'react-router-dom'
import { RiderHeader } from '../../components/RiderHeader'
import { MobileRiderNavigation } from '../../components/MobileRiderNavigation'
import { routes } from '../../routes'

const SUB_PAGE_PATHS = [routes.tripOrderDetail, routes.profileEdit, routes.profileVehicle]

export const RiderLayout = () => {
  const { pathname } = useLocation()
  const hasBackHeader = SUB_PAGE_PATHS.some((pattern) => matchPath(pattern, pathname))

  return (
    <Box bg="bg" minH="100vh" pb={{ base: '28', md: '0' }}>
      <Box display={{ base: hasBackHeader ? 'none' : 'block', md: 'block' }}>
        <RiderHeader />
      </Box>
      <Container
        as="main"
        maxW="1200px"
        paddingTop={{ base: hasBackHeader ? '3' : '6', md: '10' }}
        paddingBottom={{ base: '6', md: '10' }}
      >
        <Outlet />
      </Container>
      <MobileRiderNavigation />
    </Box>
  )
}
