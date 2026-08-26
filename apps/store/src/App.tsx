import { useRoutes } from 'react-router-dom'
import { StoreLayout } from './layouts/StoreLayout'
import { RequireAuth } from '@repo/components'
import { RequireAddress } from './components/RequireAddress'
import { authRouteObjects, authRoutes } from '@repo/auth'
import { ADMIN_URL, BRANCH_URL, MOCK_AUTH, RIDER_URL } from './config'
import { useNativeSystemBars } from './hooks/useNativeSystemBars'
import { routes } from './routes'
import { HomePage } from './pages/HomePage'
import { CatalogPage } from './pages/CatalogPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { SucursalesPage } from './pages/SucursalesPage'
import { OrdersPage } from './pages/OrdersPage'
import { OrderDetailPage } from './pages/OrderDetailPage'
import { ProfilePage } from './pages/ProfilePage'
import { EditProfilePage } from './pages/EditProfilePage'
import { AddressesPage } from './pages/AddressesPage'
import logoLight from './assets/logo-light.svg'
import logoDark from './assets/logo-dark.svg'

export const App = () => {
  useNativeSystemBars()

  return useRoutes([
    ...authRouteObjects({
      branchUrl: BRANCH_URL,
      adminUrl: ADMIN_URL,
      riderUrl: RIDER_URL,
      logoLight,
      logoDark,
    }),
    {
      element: <RequireAuth loginPath={authRoutes.login} mockAuth={MOCK_AUTH} />,
      children: [
        {
          element: <StoreLayout />,
          children: [
            { index: true, element: <HomePage /> },
            {
              element: <RequireAddress redirectPath={routes.home} />,
              children: [
                { path: routes.catalog, element: <CatalogPage /> },
                { path: routes.product, element: <ProductDetailPage /> },
                { path: routes.cart, element: <CartPage /> },
                { path: routes.checkout, element: <CheckoutPage /> },
                { path: routes.branches, element: <SucursalesPage /> },
                { path: routes.orders, element: <OrdersPage /> },
                { path: routes.orderDetail, element: <OrderDetailPage /> },
                { path: routes.profile, element: <ProfilePage /> },
                { path: routes.profileEdit, element: <EditProfilePage /> },
                { path: routes.profileAddresses, element: <AddressesPage /> },
              ],
            },
          ],
        },
      ],
    },
  ])
}
