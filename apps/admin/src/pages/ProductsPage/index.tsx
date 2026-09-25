import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GhostButton, ProductsListView, SelectField } from '@repo/components'
import { useAdminCategories, useAdminProducts } from '@repo/api'
import { optionsFromEntities, toProductListLine } from '@repo/domain'
import { productEditPath, routes } from '../../routes'

export const ProductsPage = () => {
  const { products, isLoading, isToggling, setAvailable } = useAdminProducts()
  const { categories } = useAdminCategories()
  const [category, setCategory] = useState('')
  const [availability, setAvailabilityFilter] = useState('')
  const navigate = useNavigate()

  const categoryOptions = optionsFromEntities(categories)

  const filtered = products.filter((row) => {
    const matchesCategory = !category || String(row.product.categoryId) === category
    const matchesAvailability =
      !availability ||
      (availability === 'available' ? row.product.available : !row.product.available)
    return matchesCategory && matchesAvailability
  })

  return (
    <ProductsListView
      rows={filtered.map((r) => toProductListLine(r))}
      isLoading={isLoading}
      isToggling={isToggling}
      description="Administrá el catálogo global de productos."
      onToggle={(productId, checked) => {
        void setAvailable(String(productId), checked)
      }}
      onCreate={() => navigate(routes.productNew)}
      createLabel="Nuevo producto"
      filters={
        <>
          <SelectField
            value={category}
            onChange={setCategory}
            options={categoryOptions}
            placeholder="Categoría: Todas"
            width="filterControl"
          />
          <SelectField
            value={availability}
            onChange={setAvailabilityFilter}
            options={[
              { value: 'available', label: 'Disponibles' },
              { value: 'unavailable', label: 'No disponibles' },
            ]}
            placeholder="Disponibilidad: Todos"
            width="filterControl"
          />
        </>
      }
      rowAction={(row) => (
        <GhostButton size="sm" onClick={() => navigate(productEditPath(row.product.id))}>
          Editar
        </GhostButton>
      )}
    />
  )
}
