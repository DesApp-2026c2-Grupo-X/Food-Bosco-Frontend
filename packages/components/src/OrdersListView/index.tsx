import { useMemo, useState } from 'react'
import ListUl from '@gravity-ui/icons/ListUl'
import { Link } from 'react-router-dom'
import { formatOrderDate, formatPrice, ORDER_STATUS_OPTIONS, type Order } from '@repo/domain'
import { GhostButton } from '../Button'
import { DataTable } from '../DataTable'
import type { DataTableColumn } from '../DataTable/types'
import { ListToolbar } from '../ListToolbar'
import { Muted } from '../Muted'
import { OrderStatusBadge } from '../OrderStatusBadge'
import { PageHeader } from '../PageHeader'
import { SearchInput } from '../SearchInput'
import { SelectField } from '../SelectField'
import { Strong } from '../Strong'
import { WidePageContainer } from '../WidePageContainer'
import type { OrdersListViewProps } from './types'

export const OrdersListView = ({
  orders,
  isLoading,
  description,
  orderDetailPath,
  showBranchFilter = false,
  branchColumnHideBelow,
}: OrdersListViewProps) => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [branch, setBranch] = useState('')

  const branchOptions = useMemo(
    () =>
      [...new Set(orders.map((order) => order.branch?.name ?? '—'))].map((name) => ({
        value: name,
        label: name,
      })),
    [orders],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        String(order.number).includes(query) ||
        (order.client ? `${order.client.firstName} ${order.client.lastName}` : '')
          .toLowerCase()
          .includes(query)
      const matchesStatus = !status || order.status === status
      const matchesBranch = !showBranchFilter || !branch || order.branch?.name === branch
      return matchesSearch && matchesStatus && matchesBranch
    })
  }, [orders, search, status, branch, showBranchFilter])

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
    <WidePageContainer>
      <PageHeader title="Pedidos" description={description} />

      <ListToolbar
        filters={
          <>
            <SearchInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Número o cliente..."
            />
            <SelectField
              value={status}
              onChange={setStatus}
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
      />

      <DataTable
        columns={columns}
        rows={filtered}
        getRowKey={(order) => order.id}
        isLoading={isLoading}
        emptyIcon={<ListUl width={40} height={40} />}
        emptyTitle="Sin pedidos"
        emptyDescription="No hay pedidos que coincidan con los filtros."
      />
    </WidePageContainer>
  )
}
