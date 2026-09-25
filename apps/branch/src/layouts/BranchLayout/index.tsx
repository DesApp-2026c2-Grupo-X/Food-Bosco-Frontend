import { Outlet } from 'react-router-dom'
import { DashboardLayout, IncomingOrderModal, useAudioUnlock } from '@repo/components'
import { MOCK_BRANCH_NAME, useBranch, useIncomingOrder } from '@repo/api'
import { useLogout } from '@repo/auth'
import { Logo } from '../../components/logo'
import { BranchStatusButton } from '../../components/BranchStatusButton'
import { orderDetailPath } from '../../routes'
import { navItems } from './utils/navigation'

export const BranchLayout = () => {
  const handleLogout = useLogout()
  const { incoming, acknowledge } = useIncomingOrder()
  const { branch } = useBranch()

  useAudioUnlock('/incomingOrder.mp3')

  const branchName = branch?.name ?? MOCK_BRANCH_NAME

  return (
    <DashboardLayout
      logo={Logo}
      navSections={[{ id: 'main', items: navItems }]}
      brandSubtitle={branchName}
      headerTitle={`Sucursal ${branchName}`}
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
