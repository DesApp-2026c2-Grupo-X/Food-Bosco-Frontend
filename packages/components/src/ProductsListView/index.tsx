import { Box, Image } from '@chakra-ui/react'
import ListUl from '@gravity-ui/icons/ListUl'
import { formatPrice } from '@repo/domain'
import { CrudListPage } from '../CrudListPage'
import type { DataTableColumn } from '../DataTable/types'
import { PrimaryButton } from '../Button'
import { useListFilters } from '../useListFilters'
import { Muted, Price, Strong } from '../typography'
import { ToggleSwitch } from '../ToggleSwitch'
import type { ProductListLine, ProductsListViewProps } from './types'

const PRODUCT_SEARCH_KEYS = [
  (row: ProductListLine) => row.product.name,
  (row: ProductListLine) => row.categoryName,
]

export const ProductsListView = ({
  rows,
  isLoading,
  isToggling,
  description,
  onToggle,
  filters,
  onCreate,
  createLabel = 'Nuevo producto',
  rowAction,
}: ProductsListViewProps) => {
  const list = useListFilters(rows, { searchKeys: PRODUCT_SEARCH_KEYS })

  const columns: DataTableColumn<ProductListLine>[] = [
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
          checked={row.available}
          onChange={(checked) => onToggle(row.product.id, checked)}
          disabled={isToggling}
          ariaLabel={`Disponibilidad de ${row.product.name}`}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (rowAction ? rowAction(row) : null),
    },
  ]

  return (
    <CrudListPage
      title="Productos"
      description={description}
      search={{ value: list.search, onChange: list.setSearch, placeholder: 'Buscar producto...' }}
      toolbar={filters}
      action={
        onCreate ? (
          <PrimaryButton size="md" onClick={onCreate}>
            {createLabel}
          </PrimaryButton>
        ) : undefined
      }
      columns={columns}
      rows={list.rows}
      getRowKey={(row) => row.product.id}
      isLoading={isLoading}
      emptyIcon={<ListUl width={40} height={40} />}
      emptyTitle="Sin productos"
      emptyDescription="No hay productos que coincidan con los filtros."
    />
  )
}
