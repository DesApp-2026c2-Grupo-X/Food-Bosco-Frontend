import { useRoutes } from 'react-router-dom'
import { RequireAuth } from '@repo/components'
import { authRouteObjects, authRoutes } from '@repo/auth'
import { ADMIN_URL, APP_NAME, BRANCH_URL, MOCK_AUTH, RIDER_URL, ROLES } from './config'
import { routes } from './routes'
import { RiderLayout } from './layouts/RiderLayout'
import { useNativeSystemBars } from './hooks/useNativeSystemBars'
import { HomePage } from './pages/HomePage'
import { TripOrderDetailPage } from './pages/TripOrderDetailPage'
import { HistoryPage } from './pages/HistoryPage'
import { ProfilePage } from './pages/ProfilePage'
import { EditProfilePage } from './pages/EditProfilePage'
import { VehicleEditPage } from './pages/VehicleEditPage'
import logoLight from './assets/logo-light.svg'
import logoDark from './assets/logo-dark.svg'

export const App = () => {
  useNativeSystemBars()

  return useRoutes([
    ...authRouteObjects({
      app: APP_NAME,
      branchUrl: BRANCH_URL,
      adminUrl: ADMIN_URL,
      riderUrl: RIDER_URL,
      logoLight,
      logoDark,
      registerDefaultRole: 'rider',
      registerRoles: ['rider'],
    }),
    {
      element: <RequireAuth loginPath={authRoutes.login} roles={ROLES} mockAuth={MOCK_AUTH} />,
      children: [
        {
          element: <RiderLayout />,
          children: [
            { index: true, element: <HomePage /> },
            { path: routes.tripOrderDetail, element: <TripOrderDetailPage /> },
            { path: routes.history, element: <HistoryPage /> },
            { path: routes.profile, element: <ProfilePage /> },
            { path: routes.profileEdit, element: <EditProfilePage /> },
            { path: routes.profileVehicle, element: <VehicleEditPage /> },
          ],
        },
      ],
    },
  ])
}
