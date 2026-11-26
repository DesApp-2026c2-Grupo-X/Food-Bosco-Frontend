import { cartItemCount } from '@repo/domain'
import { useStoreCart } from '../../../hooks/useStoreCart'

export const useCartCount = () => {
  const { cart, isLoading } = useStoreCart()

  return { count: cart ? cartItemCount(cart.items) : 0, isLoading }
}
