import type { CartItem } from '@repo/domain'

export interface CartLineCardProps {
  item: CartItem
  onQuantityChange: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}
