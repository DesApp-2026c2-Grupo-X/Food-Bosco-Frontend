import { useRoutes } from 'react-router-dom'
import { RequireAuth } from '@repo/components'
import { authRouteObjects, authRoutes } from '@repo/auth'
import { ADMIN_URL, BRANCH_URL, MOCK_AUTH, RIDER_URL } from './config'
import { routes } from './routes'
import { BranchLayout } from './layouts/BranchLayout'
import { HomePage } from './pages/HomePage'
import { ProductsPage } from './pages/ProductsPage'
import { StockPage } from './pages/StockPage'
import { OrdersPage } from './pages/OrdersPage'
import { OrderDetailPage } from './pages/OrderDetailPage'
import { ReportsPage } from './pages/ReportsPage'
import { ProfilePage } from './pages/ProfilePage'
import logoLight from './assets/logo-light.svg'
import logoDark from './assets/logo-dark.svg'

export const App = () =>
  useRoutes([
    ...authRouteObjects({
      branchUrl: BRANCH_URL,
      adminUrl: ADMIN_URL,
      riderUrl: RIDER_URL,
      logoLight,
      logoDark,
    }),
    {
      element: (
        <RequireAuth loginPath={authRoutes.login} roles={['branch_admin']} mockAuth={MOCK_AUTH} />
      ),
      children: [
        {
          element: <BranchLayout />,
          children: [
            { index: true, element: <HomePage /> },
            { path: routes.products, element: <ProductsPage /> },
            { path: routes.stock, element: <StockPage /> },
            { path: routes.orders, element: <OrdersPage /> },
            { path: routes.orderDetail, element: <OrderDetailPage /> },
            { path: routes.reports, element: <ReportsPage /> },
            { path: routes.profile, element: <ProfilePage /> },
          ],
        },
      ],
    },
  ])
