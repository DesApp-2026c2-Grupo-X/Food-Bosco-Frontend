import { Tabs } from '@chakra-ui/react'
import { useProductReports } from '@repo/api'
import { formatPrice, type OutOfStockRow, type ProductReportRow } from '@repo/domain'
import { DataTable } from '../DataTable'
import type { DataTableColumn } from '../DataTable/types'
import { PageHeader } from '../PageHeader'
import { Muted, Strong } from '../typography'
import { WidePageContainer } from '../WidePageContainer'
import type { ProductReportsViewProps } from './types'

const quantityColumns: DataTableColumn<ProductReportRow>[] = [
  { key: 'position', header: 'Posición', render: (row) => <Strong>{row.position}</Strong> },
  { key: 'product', header: 'Producto', render: (row) => row.product.name },
  {
    key: 'category',
    header: 'Categoría',
    hideBelow: 'sm',
    render: (row) => <Muted fontSize="sm">{row.category?.name ?? '—'}</Muted>,
  },
  {
    key: 'quantity',
    header: 'Cantidad vendida',
    render: (row) => <Strong>{row.quantity ?? 0}</Strong>,
  },
]

const revenueColumns: DataTableColumn<ProductReportRow>[] = [
  { key: 'position', header: 'Posición', render: (row) => <Strong>{row.position}</Strong> },
  { key: 'product', header: 'Producto', render: (row) => row.product.name },
  {
    key: 'category',
    header: 'Categoría',
    hideBelow: 'sm',
    render: (row) => <Muted fontSize="sm">{row.category?.name ?? '—'}</Muted>,
  },
  {
    key: 'revenue',
    header: 'Facturación',
    render: (row) => <Strong>{formatPrice(row.revenue ?? 0)}</Strong>,
  },
]

const outOfStockColumns: DataTableColumn<OutOfStockRow>[] = [
  { key: 'product', header: 'Producto', render: (row) => row.product.name },
  {
    key: 'category',
    header: 'Categoría',
    hideBelow: 'sm',
    render: (row) => <Muted fontSize="sm">{row.category?.name ?? '—'}</Muted>,
  },
  { key: 'quantity', header: 'Cantidad', render: (row) => <Strong>{row.quantity}</Strong> },
]

export const ProductReportsView = ({ description }: ProductReportsViewProps) => {
  const { bestSellers, leastSold, outOfStock, highestRevenue, isLoading } = useProductReports()

  return (
    <WidePageContainer>
      <PageHeader title="Reportes de productos" description={description} />

      <Tabs.Root defaultValue="best-sellers">
        <Tabs.List>
          <Tabs.Trigger value="best-sellers">Más vendidos</Tabs.Trigger>
          <Tabs.Trigger value="least-sold">Menos vendidos</Tabs.Trigger>
          <Tabs.Trigger value="out-of-stock">Sin stock</Tabs.Trigger>
          <Tabs.Trigger value="highest-revenue">Mayor facturación</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="best-sellers">
          <DataTable
            columns={quantityColumns}
            rows={bestSellers}
            getRowKey={(row) => row.product.id}
            isLoading={isLoading}
            emptyTitle="Sin datos"
            emptyDescription="No hay productos más vendidos para mostrar."
          />
        </Tabs.Content>

        <Tabs.Content value="least-sold">
          <DataTable
            columns={quantityColumns}
            rows={leastSold}
            getRowKey={(row) => row.product.id}
            isLoading={isLoading}
            emptyTitle="Sin datos"
            emptyDescription="No hay productos menos vendidos para mostrar."
          />
        </Tabs.Content>

        <Tabs.Content value="out-of-stock">
          <DataTable
            columns={outOfStockColumns}
            rows={outOfStock}
            getRowKey={(row) => row.product.id}
            isLoading={isLoading}
            emptyTitle="Sin productos sin stock"
            emptyDescription="No hay productos con stock en cero."
          />
        </Tabs.Content>

        <Tabs.Content value="highest-revenue">
          <DataTable
            columns={revenueColumns}
            rows={highestRevenue}
            getRowKey={(row) => row.product.id}
            isLoading={isLoading}
            emptyTitle="Sin datos"
            emptyDescription="No hay productos con facturación para mostrar."
          />
        </Tabs.Content>
      </Tabs.Root>
    </WidePageContainer>
  )
}
