import { useState } from 'react'
import Layers from '@gravity-ui/icons/Layers'
import { GhostButton, ProductsListView, RecipeModal } from '@repo/components'
import { useBranchProducts } from '@repo/api'
import type { BranchProduct } from '@repo/domain'

export const ProductsPage = () => {
  const { products, isLoading, isToggling, setAvailability } = useBranchProducts()
  const [recipeProduct, setRecipeProduct] = useState<BranchProduct | null>(null)

  return (
    <>
      <ProductsListView
        rows={products.map((r) => ({
          product: r.product,
          categoryName: r.categoryName,
          available: r.available,
        }))}
        isLoading={isLoading}
        isToggling={isToggling}
        description="Activá o pausá lo que se vende en tu sucursal."
        onToggle={(productId, checked) => {
          void setAvailability(String(productId), checked)
        }}
        rowAction={(row) => (
          <GhostButton
            size="sm"
            color="brand.600"
            onClick={() =>
              setRecipeProduct(
                products.find((p) => String(p.product.id) === String(row.product.id)) ?? null,
              )
            }
          >
            <Layers width={16} height={16} /> Ver receta
          </GhostButton>
        )}
      />

      <RecipeModal
        open={recipeProduct !== null}
        onClose={() => setRecipeProduct(null)}
        title="Receta"
        description={recipeProduct?.product.name}
        items={(recipeProduct?.product.recipe ?? []).map((item) => ({
          name: item.ingredient?.name ?? '—',
          quantity: item.quantity,
          unit: item.ingredient?.unit ?? '—',
        }))}
      />
    </>
  )
}
