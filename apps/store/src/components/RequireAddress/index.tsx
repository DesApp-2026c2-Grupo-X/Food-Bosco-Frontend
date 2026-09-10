import { Navigate, Outlet } from 'react-router-dom'
import { useAddressStore } from '../../stores/addressStore'
import type { RequireAddressProps } from './types'

export const RequireAddress = ({ redirectPath }: RequireAddressProps) => {
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId)

  if (selectedAddressId == null) {
    return <Navigate to={redirectPath} replace />
  }

  return <Outlet />
}
