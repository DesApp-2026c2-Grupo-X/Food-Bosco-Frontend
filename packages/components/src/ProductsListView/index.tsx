import { useMemo, useState } from 'react'
import { Box, Image } from '@chakra-ui/react'
import ListUl from '@gravity-ui/icons/ListUl'
import { formatPrice } from '@repo/domain'
import { DataTable } from '../DataTable'
import type { DataTableColumn } from '../DataTable/types'
import { ListToolbar } from '../ListToolbar'
import { Muted } from '../Muted'
import { PageHeader } from '../PageHeader'
import { Price } from '../Price'
import { PrimaryButton } from '../Button'
import { SearchInput } from '../SearchInput'
import { Strong } from '../Strong'
import { ToggleSwitch } from '../ToggleSwitch'
import { WidePageContainer } from '../WidePageContainer'
import type { ProductListLine, ProductsListViewProps } from './types'

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
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return rows
    return rows.filter(
      (row) =>
        row.product.name.toLowerCase().includes(query) ||
        row.categoryName.toLowerCase().includes(query),
    )
  }, [rows, search])

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
    <WidePageContainer>
      <PageHeader title="Productos" description={description} />

      <ListToolbar
        filters={
          <>
            <SearchInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar producto..."
            />
            {filters}
          </>
        }
        action={
          onCreate ? (
            <PrimaryButton size="md" onClick={onCreate}>
              {createLabel}
            </PrimaryButton>
          ) : undefined
        }
      />

      <DataTable
        columns={columns}
        rows={filtered}
        getRowKey={(row) => row.product.id}
        isLoading={isLoading}
        emptyIcon={<ListUl width={40} height={40} />}
        emptyTitle="Sin productos"
        emptyDescription="No hay productos que coincidan con los filtros."
      />
    </WidePageContainer>
  )
}
