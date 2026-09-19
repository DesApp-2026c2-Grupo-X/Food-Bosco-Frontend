import { useDisclosure } from '@chakra-ui/react'
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAddresses } from '@repo/api'
import { AppShell, useHasBackHeader } from '@repo/components'
import { StoreHeader } from '../../components/StoreHeader'
import { MobileStoreNavigation } from '../../components/MobileStoreNavigation'
import { useCartCount } from '../../components/CartButton/hooks/useCartCount'
import { AddressPickerModal } from '../../components/AddressPickerModal'
import { routes } from '../../routes'
import { useAddressStore } from '../../stores/addressStore'

export const StoreLayout = () => {
  const { open, onOpen, onClose } = useDisclosure()
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId)
  const clearAddress = useAddressStore((state) => state.clearAddress)
  const { addresses, isLoading } = useAddresses()
  const { count } = useCartCount()
  const hasBackHeader = useHasBackHeader([
    routes.profileEdit,
    routes.profileAddresses,
    routes.branches,
    routes.checkout,
    routes.product,
    routes.orderDetail,
  ])

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
    <AppShell
      header={<StoreHeader count={count} onOpenLocation={onOpen} />}
      showHeader={!hasBackHeader}
      mobileNav={<MobileStoreNavigation count={count} />}
      overlays={<AddressPickerModal open={open} onClose={onClose} closable={hasValidAddress} />}
    >
      <Outlet />
    </AppShell>
  )
}
