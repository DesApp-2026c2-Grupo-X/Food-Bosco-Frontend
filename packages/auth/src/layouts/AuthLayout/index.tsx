import { useLocation } from 'react-router-dom'
import { AuthShell } from '../../components/AuthShell'
import { BackButton, Logo } from '@repo/components'
import { authRoutes } from '../../routes'

const LOGIN_IMAGE =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80'

export interface AuthLayoutProps {
  logoLight?: string
  logoDark?: string
  image?: string
}

export const AuthLayout = ({ logoLight, logoDark, image = LOGIN_IMAGE }: AuthLayoutProps) => {
  const { pathname } = useLocation()
  const isLogin = pathname === authRoutes.login

  const leading =
    isLogin && logoLight && logoDark ? (
      <Logo lightSrc={logoLight} darkSrc={logoDark} height="40px" />
    ) : (
      <BackButton />
    )

  return <AuthShell image={image} leading={leading} />
}
