import { Routes, Route } from 'react-router-dom'
import { StoreLayout } from './layouts/StoreLayout'
import { RequireAuth } from '@repo/components'
import { routes } from './routes'
import { AUTH_URL, MOCK_AUTH } from './config'
import { useNativeSystemBars } from './hooks/useNativeSystemBars'
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

export const App = () => {
  useNativeSystemBars()

  return (
    <Routes>
      <Route element={<RequireAuth loginPath={`${AUTH_URL}/login`} mockAuth={MOCK_AUTH} />}>
        <Route element={<StoreLayout />}>
          <Route index element={<HomePage />} />
          <Route path={routes.catalog} element={<CatalogPage />} />
          <Route path={routes.product} element={<ProductDetailPage />} />
          <Route path={routes.cart} element={<CartPage />} />
          <Route path={routes.checkout} element={<CheckoutPage />} />
          <Route path={routes.branches} element={<SucursalesPage />} />
          <Route path={routes.orders} element={<OrdersPage />} />
          <Route path={routes.orderDetail} element={<OrderDetailPage />} />
          <Route path={routes.profile} element={<ProfilePage />} />
          <Route path={routes.profileEdit} element={<EditProfilePage />} />
          <Route path={routes.profileAddresses} element={<AddressesPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
