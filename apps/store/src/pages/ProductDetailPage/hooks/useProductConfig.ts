import { useMemo, useState } from 'react'
import { useProduct } from '@repo/api'
import { useCartStore } from '../../../stores/cartStore'
import type { ProductOptionType } from '@repo/domain'

type SelectionMap = Record<number, number | number[]>

export const useProductConfig = (productId: number | undefined) => {
  const { product, isLoading } = useProduct(productId)
  const addLine = useCartStore((state) => state.addLine)

  const [selection, setSelection] = useState<SelectionMap>({})
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')

  const selectOption = (groupId: number, optionId: number, type: ProductOptionType) => {
    setSelection((prev) => {
      if (type === 'single') return { ...prev, [groupId]: optionId }

      const current = prev[groupId]
      const list = Array.isArray(current) ? current : []
      const next = list.includes(optionId)
        ? list.filter((id) => id !== optionId)
        : [...list, optionId]
      return { ...prev, [groupId]: next }
    })
  }

  const selectedOptions = useMemo(() => {
    if (!product) return []
    return product.configGroups.flatMap((group) => {
      const selected = selection[group.id]
      const ids = Array.isArray(selected) ? selected : selected !== undefined ? [selected] : []
      return ids.flatMap((id) => {
        const option = group.options.find((o) => o.id === id)
        return option ? [{ group: group.name, option: option.name, delta: option.priceDelta }] : []
      })
    })
  }, [product, selection])

  const unitPrice = useMemo(
    () => (product ? product.price + selectedOptions.reduce((sum, o) => sum + o.delta, 0) : 0),
    [product, selectedOptions],
  )

  const total = unitPrice * quantity

  const missingRequired = useMemo(() => {
    if (!product) return false
    return product.configGroups.some((group) => group.required && selection[group.id] === undefined)
  }, [product, selection])

  const canAdd = Boolean(product && product.available && !missingRequired)

  const addToCart = () => {
    if (!product || !canAdd) return
    addLine({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      options: selectedOptions,
      notes: notes.trim() || undefined,
    })
  }

  return {
    product,
    isLoading,
    selection,
    selectOption,
    quantity,
    setQuantity,
    notes,
    setNotes,
    unitPrice,
    total,
    missingRequired,
    canAdd,
    addToCart,
  }
}
