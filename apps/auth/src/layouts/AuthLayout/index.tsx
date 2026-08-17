import { useLocation } from 'react-router-dom'
import { AuthLayout as SharedAuthLayout } from '../../components/AuthLayout'
import { BackButton, Logo } from '@repo/components'
import logoLight from '../../assets/logo-light.svg'
import logoDark from '../../assets/logo-dark.svg'
import { routes } from '../../routes'

const LOGIN_IMAGE =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80'

export const AuthLayout = () => {
  const { pathname } = useLocation()
  const isLogin = pathname === routes.login

  return (
    <SharedAuthLayout
      image={LOGIN_IMAGE}
      leading={
        isLogin ? <Logo lightSrc={logoLight} darkSrc={logoDark} height="40px" /> : <BackButton />
      }
    />
  )
}
