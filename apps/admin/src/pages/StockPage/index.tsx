import { useState } from 'react'
import { AdjustStockModal, SelectField, StockListView } from '@repo/components'
import { useBranches, useGlobalStock } from '@repo/api'
import { optionsFromEntities, type BranchStock } from '@repo/domain'

export const StockPage = () => {
  const { stock, isLoading, isAdjusting, adjust } = useGlobalStock()
  const { branches } = useBranches()
  const [branch, setBranch] = useState('')
  const [selected, setSelected] = useState<BranchStock | null>(null)

  const branchName = (branchId: string) =>
    branches.find((b) => b.id === branchId)?.name ?? `Sucursal ${branchId}`

  const branchOptions = optionsFromEntities(branches)

  const filtered = branch ? stock.filter((row) => String(row.branchId) === branch) : stock

  const handleSubmit = async (delta: number, reason: string) => {
    if (!selected) return
    await adjust(selected.branchId, selected.ingredientId, delta, reason)
    setSelected(null)
  }

  return (
    <>
      <StockListView
        rows={filtered}
        isLoading={isLoading}
        isAdjusting={isAdjusting}
        title="Stock de ingredientes"
        description="Controlá el inventario de ingredientes de todas las sucursales."
        onAdjust={setSelected}
        showBranch
        branchName={branchName}
        filters={
          <SelectField
            value={branch}
            onChange={setBranch}
            options={branchOptions}
            placeholder="Sucursal: Todas"
            width="filterControl"
          />
        }
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
