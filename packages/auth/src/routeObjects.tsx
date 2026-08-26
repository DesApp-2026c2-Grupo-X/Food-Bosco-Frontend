import type { RouteObject } from 'react-router-dom'
import { AuthProvider } from './AuthProvider'
import type { AuthAppConfig } from './authConfigContext'
import { AuthLayout } from './layouts/AuthLayout'
import { authRoutes } from './routes'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'

export interface AuthRoutesConfig extends AuthAppConfig {
  logoLight?: string
  logoDark?: string
}

export const authRouteObjects = (config: AuthRoutesConfig = {}): RouteObject[] => [
  {
    element: (
      <AuthProvider
        defaultPath={config.defaultPath}
        branchUrl={config.branchUrl}
        adminUrl={config.adminUrl}
        riderUrl={config.riderUrl}
        redirectByRole={config.redirectByRole}
      >
        <AuthLayout logoLight={config.logoLight} logoDark={config.logoDark} />
      </AuthProvider>
    ),
    children: [
      { path: authRoutes.login, element: <LoginPage /> },
      { path: authRoutes.register, element: <RegisterPage /> },
      { path: authRoutes.forgotPassword, element: <ForgotPasswordPage /> },
      { path: authRoutes.resetPassword, element: <ResetPasswordPage /> },
    ],
  },
]
