import { useRoutes } from 'react-router-dom'
import { RequireAuth } from '@repo/components'
import { authRouteObjects, authRoutes } from '@repo/auth'
import { ADMIN_URL, BRANCH_URL, MOCK_AUTH, RIDER_URL } from './config'
import { routes } from './routes'
import { AdminLayout } from './layouts/AdminLayout'
import { HomePage } from './pages/HomePage'
import { ProfilePage } from './pages/ProfilePage'
import { CategoriesPage } from './pages/CategoriesPage'
import { ProductsPage } from './pages/ProductsPage'
import { ProductEditPage } from './pages/ProductEditPage'
import { IngredientsPage } from './pages/IngredientsPage'
import { BranchesPage } from './pages/BranchesPage'
import { BranchEditPage } from './pages/BranchEditPage'
import { PromotionsPage } from './pages/PromotionsPage'
import { StaffPage } from './pages/StaffPage'
import { StaffEditPage } from './pages/StaffEditPage'
import { StatesPage } from './pages/StatesPage'
import { ParametersPage } from './pages/ParametersPage'
import { OrdersPage } from './pages/OrdersPage'
import { OrderDetailPage } from './pages/OrderDetailPage'
import { StockPage } from './pages/StockPage'
import { ReportsPage } from './pages/ReportsPage'
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
        <RequireAuth loginPath={authRoutes.login} roles={['super_admin']} mockAuth={MOCK_AUTH} />
      ),
      children: [
        {
          element: <AdminLayout />,
          children: [
            { index: true, element: <HomePage /> },
            { path: routes.categories, element: <CategoriesPage /> },
            { path: routes.categoryNew, element: <CategoriesPage /> },
            { path: routes.categoryEdit, element: <CategoriesPage /> },
            { path: routes.products, element: <ProductsPage /> },
            { path: routes.productNew, element: <ProductEditPage /> },
            { path: routes.productEdit, element: <ProductEditPage /> },
            { path: routes.ingredients, element: <IngredientsPage /> },
            { path: routes.branches, element: <BranchesPage /> },
            { path: routes.branchNew, element: <BranchEditPage /> },
            { path: routes.branchEdit, element: <BranchEditPage /> },
            { path: routes.promotions, element: <PromotionsPage /> },
            { path: routes.promotionNew, element: <PromotionsPage /> },
            { path: routes.promotionEdit, element: <PromotionsPage /> },
            { path: routes.staff, element: <StaffPage /> },
            { path: routes.staffNew, element: <StaffEditPage /> },
            { path: routes.staffEdit, element: <StaffEditPage /> },
            { path: routes.states, element: <StatesPage /> },
            { path: routes.parameters, element: <ParametersPage /> },
            { path: routes.orders, element: <OrdersPage /> },
            { path: routes.orderDetail, element: <OrderDetailPage /> },
            { path: routes.stock, element: <StockPage /> },
            { path: routes.reports, element: <ReportsPage /> },
            { path: routes.profile, element: <ProfilePage /> },
          ],
        },
      ],
    },
  ])
