import { Outlet } from 'react-router-dom'
import { DashboardLayout, IncomingOrderModal, useAudioUnlock } from '@repo/components'
import { MOCK_BRANCH_NAME, useIncomingOrder } from '@repo/api'
import { useLogout } from '@repo/auth'
import { Logo } from '../../components/logo'
import { BranchStatusButton } from '../../components/BranchStatusButton'
import { orderDetailPath } from '../../routes'
import { navItems } from './utils/navigation'

export const BranchLayout = () => {
  const handleLogout = useLogout()
  const { incoming, acknowledge } = useIncomingOrder()

  useAudioUnlock('/incomingOrder.mp3')

  return (
    <DashboardLayout
      logo={Logo}
      navSections={[{ id: 'main', items: navItems }]}
      brandSubtitle={MOCK_BRANCH_NAME}
      headerTitle={`Sucursal ${MOCK_BRANCH_NAME}`}
      onLogout={handleLogout}
      headerActions={<BranchStatusButton />}
      extras={
        <IncomingOrderModal
          order={incoming}
          onClose={acknowledge}
          orderDetailPath={orderDetailPath}
        />
      }
    >
      <Outlet />
    </DashboardLayout>
  )
}
