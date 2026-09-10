import { useLocation } from 'react-router-dom'
import { AuthLayout as SharedAuthLayout } from '../../components/AuthLayout'
import { BackButton, Logo } from '@repo/components'
import { authRoutes } from '../../routes'

const LOGIN_IMAGE =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80'

export interface AuthLayoutProps {
  logoLight?: string
  logoDark?: string
}

export const AuthLayout = ({ logoLight, logoDark }: AuthLayoutProps) => {
  const { pathname } = useLocation()
  const isLogin = pathname === authRoutes.login

  const leading =
    isLogin && logoLight && logoDark ? (
      <Logo lightSrc={logoLight} darkSrc={logoDark} height="40px" />
    ) : (
      <BackButton />
    )

  return <SharedAuthLayout image={LOGIN_IMAGE} leading={leading} />
}
