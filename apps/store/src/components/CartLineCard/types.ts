import type { CartLine } from '../../stores/cartStore'

export interface CartLineCardProps {
  line: CartLine
  onQuantityChange: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}
