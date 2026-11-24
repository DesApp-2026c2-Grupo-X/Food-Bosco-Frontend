import { useCart } from '@repo/api'
import { useAddressStore } from '../stores/addressStore'

export const useStoreCart = () => {
  const selectedAddressId = useAddressStore((state) => state.selectedAddressId)
  return useCart(selectedAddressId)
}
