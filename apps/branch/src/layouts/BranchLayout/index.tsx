import { Outlet, useNavigate } from 'react-router-dom'
import { DashboardLayout, IncomingOrderModal, useAudioUnlock } from '@repo/components'
import { MOCK_BRANCH_NAME, useAuthStore, useIncomingOrder } from '@repo/api'
import { authRoutes } from '@repo/auth'
import { Logo } from '../../components/logo'
import { BranchStatusButton } from '../../components/BranchStatusButton'
import { orderDetailPath } from '../../routes'
import { navItems } from './utils/navigation'

export const BranchLayout = () => {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const { incoming, acknowledge } = useIncomingOrder()

  useAudioUnlock('/incomingOrder.mp3')

  const handleLogout = () => {
    logout()
    navigate(authRoutes.login)
  }

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
