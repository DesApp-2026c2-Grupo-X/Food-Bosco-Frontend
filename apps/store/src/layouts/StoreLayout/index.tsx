import { Box, Container, useDisclosure } from '@chakra-ui/react'
import { useEffect } from 'react'
import { Outlet, matchPath, useLocation } from 'react-router-dom'
import { useAddresses } from '@repo/api'
import { StoreHeader } from '../../components/StoreHeader'
import { MobileStoreNavigation } from '../../components/MobileStoreNavigation'
import { AddressPickerModal } from '../../components/AddressPickerModal'
import { routes } from '../../routes'
import { useAddressStore } from '../../stores/addressStore'

const SUB_PAGE_PATHS = [
  routes.profileEdit,
  routes.profileAddresses,
  routes.branches,
  routes.checkout,
  routes.product,
  routes.orderDetail,
]

export const StoreLayout = () => {
  const { open, onOpen, onClose } = useDisclosure()
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId)
  const clearAddress = useAddressStore((state) => state.clearAddress)
  const { addresses, isLoading } = useAddresses()
  const { pathname } = useLocation()
  const hasBackHeader = SUB_PAGE_PATHS.some((pattern) => matchPath(pattern, pathname))

  const hasValidAddress =
    selectedAddressId != null && addresses.some((address) => address.id === selectedAddressId)

  useEffect(() => {
    if (isLoading) return
    if (!hasValidAddress) {
      if (selectedAddressId != null) clearAddress()
      onOpen()
    }
  }, [selectedAddressId, hasValidAddress, isLoading, onOpen, clearAddress])

  return (
    <Box bg="bg" minH="100vh" pb={{ base: '28', md: '0' }}>
      <Box display={{ base: hasBackHeader ? 'none' : 'block', md: 'block' }}>
        <StoreHeader onOpenLocation={onOpen} />
      </Box>
      <Container
        as="main"
        maxW="1200px"
        paddingTop={{ base: hasBackHeader ? '3' : '6', md: '10' }}
        paddingBottom={{ base: '6', md: '10' }}
      >
        <Outlet />
      </Container>
      <MobileStoreNavigation />
      <AddressPickerModal open={open} onClose={onClose} closable={hasValidAddress} />
    </Box>
  )
}
