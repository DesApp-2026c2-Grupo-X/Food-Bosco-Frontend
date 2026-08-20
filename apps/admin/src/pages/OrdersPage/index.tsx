import { useMemo, useState } from 'react'
import { VStack } from '@chakra-ui/react'
import ListUl from '@gravity-ui/icons/ListUl'
import { Link } from 'react-router-dom'
import {
  DataTable,
  type DataTableColumn,
  EmptyState,
  FilterBar,
  GhostButton,
  Muted,
  OrderStatusBadge,
  PageTitle,
  SearchInput,
  SelectField,
  Strong,
  WidePageContainer,
} from '@repo/components'
import { useGlobalOrders } from '@repo/api'
import { formatOrderDate, formatPrice, ORDER_STATUS_LABELS, type Order } from '@repo/domain'
import { orderDetailPath } from '../../routes'

const STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export const OrdersPage = () => {
  const { orders, isLoading } = useGlobalOrders()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [branch, setBranch] = useState('')

  const branchOptions = useMemo(
    () => [...new Set(orders.map((order) => order.branch))].map((name) => ({ value: name, label: name })),
    [orders],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        String(order.number).includes(query) ||
        (order.customer?.name ?? '').toLowerCase().includes(query)
      const matchesStatus = !status || order.status === status
      const matchesBranch = !branch || order.branch === branch
      return matchesSearch && matchesStatus && matchesBranch
    })
  }, [orders, search, status, branch])

  const columns: DataTableColumn<Order>[] = [
    {
      key: 'number',
      header: 'Número',
      render: (order) => <Strong>#{order.number}</Strong>,
    },
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
      render: (order) => <Muted fontSize="sm">{order.customer?.name ?? '—'}</Muted>,
    },
    {
      key: 'branch',
      header: 'Sucursal',
      render: (order) => <Muted fontSize="sm">{order.branch}</Muted>,
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
      <VStack align="start" gap="1">
        <PageTitle>Pedidos</PageTitle>
        <Muted>Consultá y operá los pedidos de todas las sucursales.</Muted>
      </VStack>

      <FilterBar>
        <SearchInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Número o cliente..."
        />
        <SelectField
          value={status}
          onChange={setStatus}
          options={STATUS_OPTIONS}
          placeholder="Estado: Todos"
          width="200px"
        />
        <SelectField
          value={branch}
          onChange={setBranch}
          options={branchOptions}
          placeholder="Sucursal: Todas"
          width="200px"
        />
      </FilterBar>

      {!isLoading && filtered.length === 0 ? (
        <EmptyState
          icon={<ListUl width={40} height={40} />}
          title="Sin pedidos"
          description="No hay pedidos que coincidan con los filtros."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(order) => order.id}
          isLoading={isLoading}
          emptyTitle="Sin pedidos"
          emptyDescription="No hay pedidos para mostrar."
        />
      )}
    </WidePageContainer>
  )
}
