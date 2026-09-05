import { useCart } from '@repo/api'
import { cartItemCount } from '@repo/domain'

export const useCartCount = () => {
  const { cart, isLoading } = useCart()

  return { count: cart ? cartItemCount(cart.items) : 0, isLoading }
}
