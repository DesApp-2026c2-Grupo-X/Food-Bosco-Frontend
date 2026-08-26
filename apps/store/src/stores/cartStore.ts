import { create } from 'zustand'

export interface CartOption {
  group: string
  option: string
  delta: number
}

export interface CartLine {
  id: string
  productId: number
  name: string
  price: number
  image: string
  quantity: number
  options: CartOption[]
  notes?: string
}

interface CartState {
  lines: CartLine[]
  addLine: (line: Omit<CartLine, 'id' | 'quantity'> & { quantity?: number }) => void
  removeLine: (id: string) => void
  setQuantity: (id: string, quantity: number) => void
  clear: () => void
}

const signature = (productId: number, options: CartOption[], notes?: string) =>
  `${productId}:${options
    .map((o) => `${o.group}:${o.option}`)
    .sort()
    .join('|')}:${notes ?? ''}`

export const useCartStore = create<CartState>((set) => ({
  lines: [],

  addLine: (line) =>
    set((state) => {
      const key = signature(line.productId, line.options, line.notes)
      const existing = state.lines.find((l) => signature(l.productId, l.options, l.notes) === key)

      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.id === existing.id ? { ...l, quantity: l.quantity + (line.quantity ?? 1) } : l,
          ),
        }
      }

      const newLine: CartLine = {
        ...line,
        id: `${line.productId}-${Date.now()}`,
        quantity: line.quantity ?? 1,
      }
      return { lines: [...state.lines, newLine] }
    }),

  removeLine: (id) => set((state) => ({ lines: state.lines.filter((l) => l.id !== id) })),

  setQuantity: (id, quantity) =>
    set((state) => ({
      lines:
        quantity <= 0
          ? state.lines.filter((l) => l.id !== id)
          : state.lines.map((l) => (l.id === id ? { ...l, quantity } : l)),
    })),

  clear: () => set({ lines: [] }),
}))

export const lineUnitPrice = (line: CartLine) =>
  line.price + line.options.reduce((sum, o) => sum + o.delta, 0)

export const lineTotal = (line: CartLine) => lineUnitPrice(line) * line.quantity

export const cartItemCount = (lines: CartLine[]) => lines.reduce((sum, l) => sum + l.quantity, 0)

export const cartTotal = (lines: CartLine[]) => lines.reduce((sum, l) => sum + lineTotal(l), 0)
