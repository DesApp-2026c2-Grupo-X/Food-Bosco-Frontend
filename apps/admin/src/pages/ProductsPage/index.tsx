import { useMemo, useState } from 'react'
import { Box, HStack, Image, VStack } from '@chakra-ui/react'
import ListUl from '@gravity-ui/icons/ListUl'
import { useNavigate } from 'react-router-dom'
import {
  DataTable,
  type DataTableColumn,
  EmptyState,
  FilterBar,
  GhostButton,
  Muted,
  PageTitle,
  Price,
  PrimaryButton,
  SearchInput,
  SelectField,
  Strong,
  ToggleSwitch,
  WidePageContainer,
} from '@repo/components'
import { useAdminCategories, useAdminProducts, type AdminProductRow } from '@repo/api'
import { formatPrice } from '@repo/domain'
import { productEditPath, routes } from '../../routes'

export const ProductsPage = () => {
  const { products, isLoading, isToggling, setAvailable } = useAdminProducts()
  const { categories } = useAdminCategories()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [availability, setAvailabilityFilter] = useState('')
  const navigate = useNavigate()

  const categoryOptions = categories.map((c) => ({ value: String(c.id), label: c.name }))

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return products.filter((row) => {
      const matchesSearch =
        !query ||
        row.product.name.toLowerCase().includes(query) ||
        row.categoryName.toLowerCase().includes(query)
      const matchesCategory = !category || String(row.product.categoryId) === category
      const matchesAvailability =
        !availability ||
        (availability === 'available' ? row.product.available : !row.product.available)
      return matchesSearch && matchesCategory && matchesAvailability
    })
  }, [products, search, category, availability])

  const columns: DataTableColumn<AdminProductRow>[] = [
    {
      key: 'image',
      header: '',
      render: (row) =>
        row.product.image ? (
          <Image
            src={row.product.image}
            alt={row.product.name}
            boxSize="40px"
            borderRadius="lg"
            objectFit="cover"
          />
        ) : (
          <Box boxSize="40px" borderRadius="lg" bg="bg.muted" />
        ),
    },
    { key: 'name', header: 'Nombre', render: (row) => <Strong>{row.product.name}</Strong> },
    {
      key: 'category',
      header: 'Categoría',
      hideBelow: 'sm',
      render: (row) => <Muted fontSize="sm">{row.categoryName}</Muted>,
    },
    {
      key: 'price',
      header: 'Precio',
      render: (row) => <Price>{formatPrice(row.product.price)}</Price>,
    },
    {
      key: 'available',
      header: 'Disponible',
      render: (row) => (
        <ToggleSwitch
          checked={row.product.available}
          onChange={(checked) => setAvailable(row.product.id, checked)}
          disabled={isToggling}
          ariaLabel={`Disponibilidad de ${row.product.name}`}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <GhostButton size="sm" onClick={() => navigate(productEditPath(row.product.id))}>
          Editar
        </GhostButton>
      ),
    },
  ]

  return (
    <WidePageContainer>
      <VStack align="start" gap="1">
        <PageTitle>Productos</PageTitle>
        <Muted>Administrá el catálogo global de productos.</Muted>
      </VStack>

      <HStack justify="space-between" align="center" width="full" wrap="wrap" gap="3">
        <FilterBar width="auto" flexGrow="1">
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar producto..."
          />
          <SelectField
            value={category}
            onChange={setCategory}
            options={categoryOptions}
            placeholder="Categoría: Todas"
            width="200px"
          />
          <SelectField
            value={availability}
            onChange={setAvailabilityFilter}
            options={[
              { value: 'available', label: 'Disponibles' },
              { value: 'unavailable', label: 'No disponibles' },
            ]}
            placeholder="Disponibilidad: Todos"
            width="200px"
          />
        </FilterBar>
        <PrimaryButton size="md" onClick={() => navigate(routes.productNew)}>
          Nuevo producto
        </PrimaryButton>
      </HStack>

      {!isLoading && filtered.length === 0 ? (
        <EmptyState
          icon={<ListUl width={40} height={40} />}
          title="Sin productos"
          description="No hay productos que coincidan con los filtros."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(row) => row.product.id}
          isLoading={isLoading}
          emptyTitle="Sin productos"
          emptyDescription="No hay productos para mostrar."
        />
      )}
    </WidePageContainer>
  )
}
