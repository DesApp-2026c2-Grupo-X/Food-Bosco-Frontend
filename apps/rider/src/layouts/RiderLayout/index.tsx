import { Outlet } from 'react-router-dom'
import { AppShell, useAudioUnlock, useHasBackHeader } from '@repo/components'
import { RiderHeader } from '../../components/RiderHeader'
import { MobileRiderNavigation } from '../../components/MobileRiderNavigation'
import { routes } from '../../routes'

export const RiderLayout = () => {
  const hasBackHeader = useHasBackHeader([
    routes.tripOrderDetail,
    routes.profileEdit,
    routes.profileVehicle,
  ])

  useAudioUnlock('/incomingOrder.mp3')

  return (
    <AppShell
      header={<RiderHeader />}
      showHeader={!hasBackHeader}
      mobileNav={<MobileRiderNavigation />}
    >
      <Outlet />
    </AppShell>
  )
}
