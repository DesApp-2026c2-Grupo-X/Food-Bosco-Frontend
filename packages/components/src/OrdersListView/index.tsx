import { useMemo, useState } from 'react'
import ListUl from '@gravity-ui/icons/ListUl'
import { Link } from 'react-router-dom'
import { formatOrderDate, formatPrice, ORDER_STATUS_OPTIONS, type Order } from '@repo/domain'
import { GhostButton } from '../Button'
import { CrudListPage } from '../CrudListPage'
import type { DataTableColumn } from '../DataTable/types'
import { OrderStatusBadge } from '../OrderStatusBadge'
import { SelectField } from '../SelectField'
import { useListFilters } from '../useListFilters'
import { Muted, Strong } from '../typography'
import type { OrdersListViewProps } from './types'

const ORDER_SEARCH_KEYS = [
  (order: Order) => String(order.number),
  (order: Order) => (order.client ? `${order.client.firstName} ${order.client.lastName}` : null),
]

const matchesOrderStatus = (order: Order, status: string) => order.status === status

export const OrdersListView = ({
  orders,
  isLoading,
  description,
  orderDetailPath,
  showBranchFilter = false,
  branchColumnHideBelow,
}: OrdersListViewProps) => {
  const [branch, setBranch] = useState('')

  const branchOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const order of orders) {
      const id = order.branchId || '—'
      if (!map.has(id)) map.set(id, order.branch?.name ?? 'Sin sucursal')
    }
    return [...map.entries()].map(([value, label]) => ({ value, label }))
  }, [orders])

  const filters = useListFilters(orders, {
    searchKeys: ORDER_SEARCH_KEYS,
    matchesStatus: matchesOrderStatus,
  })

  const rows = useMemo(
    () =>
      filters.rows.filter(
        (order) => !showBranchFilter || !branch || (order.branchId || '—') === branch,
      ),
    [filters.rows, showBranchFilter, branch],
  )

  const columns: DataTableColumn<Order>[] = [
    { key: 'number', header: 'Número', render: (order) => <Strong>#{order.number}</Strong> },
    {
      key: 'date',
      header: 'Fecha/hora',
      hideBelow: 'md',
      render: (order) => <Muted fontSize="sm">{formatOrderDate(order.createdAt)}</Muted>,
    },
    {
      key: 'client',
      header: 'Cliente',
      hideBelow: 'sm',
      render: (order) => (
        <Muted fontSize="sm">
          {order.client ? `${order.client.firstName} ${order.client.lastName}` : '—'}
        </Muted>
      ),
    },
    {
      key: 'branch',
      header: 'Sucursal',
      hideBelow: branchColumnHideBelow,
      render: (order) => <Muted fontSize="sm">{order.branch?.name ?? '—'}</Muted>,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (order) => <OrderStatusBadge status={order.status} />,
    },
    {
      key: 'total',
      header: 'Total',
      render: (order) => <Strong>{formatPrice(order.total)}</Strong>,
    },
    {
      key: 'action',
      header: '',
      render: (order) => (
        <GhostButton asChild size="sm">
          <Link to={orderDetailPath(order.id)}>Ver</Link>
        </GhostButton>
      ),
    },
  ]

  return (
    <CrudListPage
      title="Pedidos"
      description={description}
      search={{
        value: filters.search,
        onChange: filters.setSearch,
        placeholder: 'Número o cliente...',
      }}
      toolbar={
        <>
          <SelectField
            value={filters.status}
            onChange={filters.setStatus}
            options={ORDER_STATUS_OPTIONS}
            placeholder="Estado: Todos"
            width="filterControl"
          />
          {showBranchFilter ? (
            <SelectField
              value={branch}
              onChange={setBranch}
              options={branchOptions}
              placeholder="Sucursal: Todas"
              width="filterControl"
            />
          ) : null}
        </>
      }
      columns={columns}
      rows={rows}
      getRowKey={(order) => order.id}
      isLoading={isLoading}
      emptyIcon={<ListUl width={40} height={40} />}
      emptyTitle="Sin pedidos"
      emptyDescription="No hay pedidos que coincidan con los filtros."
    />
  )
}
