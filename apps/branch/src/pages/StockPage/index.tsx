import { useState } from 'react'
import { AdjustStockModal, StockListView } from '@repo/components'
import { useBranchStock } from '@repo/api'
import type { BranchStock } from '@repo/domain'

export const StockPage = () => {
  const { stock, isLoading, isAdjusting, adjust } = useBranchStock()
  const [selected, setSelected] = useState<BranchStock | null>(null)

  const handleSubmit = async (delta: number, reason: string) => {
    if (!selected) return
    await adjust(selected.ingredientId, delta, reason)
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
