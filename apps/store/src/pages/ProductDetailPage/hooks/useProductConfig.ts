import { useMemo, useState } from 'react'
import { useCart, useProduct } from '@repo/api'
import { notifyError, notifySuccess } from '@repo/components'
import type { ProductOptionType } from '@repo/domain'

type SelectionMap = Record<string, string | string[]>

export const useProductConfig = (productId: string | undefined) => {
  const { product, isLoading } = useProduct(productId)
  const { addItem, isMutating } = useCart()

  const [selection, setSelection] = useState<SelectionMap>({})
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const selectOption = (groupId: string, optionId: string, type: ProductOptionType) => {
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

  const selectedOptionIds = useMemo(() => {
    if (!product) return []
    return product.configGroups.flatMap((group) => {
      const selected = selection[group.id]
      const ids = Array.isArray(selected) ? selected : selected !== undefined ? [selected] : []
      return ids
    })
  }, [product, selection])

  const unitPrice = useMemo(() => {
    if (!product) return 0
    const extras = product.configGroups
      .flatMap((group) => {
        const selected = selection[group.id]
        const ids = Array.isArray(selected) ? selected : selected !== undefined ? [selected] : []
        return ids.flatMap((id) => {
          const option = group.options.find((o) => o.id === id)
          return option ? [option.extraPrice] : []
        })
      })
      .reduce((sum, value) => sum + value, 0)
    return product.price + extras
  }, [product, selection])

  const total = unitPrice * quantity

  const missingRequired = useMemo(() => {
    if (!product) return false
    return product.configGroups.some((group) => group.required && selection[group.id] === undefined)
  }, [product, selection])

  const canAdd = Boolean(product && product.available && !missingRequired)

  const addToCart = async (): Promise<boolean> => {
    if (!product || !canAdd || isMutating) return false
    setError(null)
    try {
      await addItem({
        productId: product.id,
        quantity,
        observations: notes.trim().slice(0, 500) || null,
        optionIds: selectedOptionIds,
      })
      notifySuccess({
        title: 'Producto agregado',
        description: `${product.name} se sumó a tu carrito.`,
      })
      return true
    } catch {
      const message = 'No pudimos agregar el producto. Intentá de nuevo.'
      setError(message)
      notifyError({ title: 'No se pudo agregar', description: message })
      return false
    }
  }

  return {
    product,
    isLoading,
    isAdding: isMutating,
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
    error,
    addToCart,
  }
}
