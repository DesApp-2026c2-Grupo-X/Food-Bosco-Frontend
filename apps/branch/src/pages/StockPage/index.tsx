import { useState } from 'react'
import { AdjustStockModal, StockListView, notifyWarning } from '@repo/components'
import { useBranchStock } from '@repo/api'
import type { BranchStock } from '@repo/domain'

export const StockPage = () => {
  const { stock, isLoading, isAdjusting, adjust } = useBranchStock()
  const [selected, setSelected] = useState<BranchStock | null>(null)

  const handleSubmit = async (delta: number, reason: string) => {
    if (!selected) return
    await adjust(selected.ingredientId, delta, reason)
    const minQuantity = selected.ingredient?.minQuantity ?? 0
    const newQuantity = selected.quantity + delta
    if (minQuantity > 0 && newQuantity <= minQuantity) {
      notifyWarning({
        title: 'Stock en alerta',
        description: `${selected.ingredient?.name ?? 'El ingrediente'} quedó con ${newQuantity} ${selected.ingredient?.unit ?? ''} (mínimo: ${minQuantity}).`,
      })
    }
    setSelected(null)
  }

  return (
    <>
      <StockListView
        rows={stock}
        isLoading={isLoading}
        isAdjusting={isAdjusting}
        title="Stock de mi almacén"
        description="Controlá el inventario de ingredientes de tu sucursal."
        onAdjust={setSelected}
        emptyTitle="Sin ingredientes"
        emptyDescription="No hay ingredientes que coincidan con la búsqueda."
      />

      <AdjustStockModal
        ingredient={selected}
        isSubmitting={isAdjusting}
        onClose={() => setSelected(null)}
        onSubmit={handleSubmit}
      />
    </>
  )
}
