import { cartItemCount, useCartStore } from '../../../stores/cartStore'

export const useCartCount = () => {
  const lines = useCartStore((state) => state.lines)

  return { count: cartItemCount(lines), isLoading: false }
}
