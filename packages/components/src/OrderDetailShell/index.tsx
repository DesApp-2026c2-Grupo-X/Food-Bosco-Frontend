import { BackButton } from '../BackButton'
import { OrderStatusBadge } from '../OrderStatusBadge'
import { PageContainer } from '../PageContainer'
import { PageHeader } from '../PageHeader'
import type { OrderDetailShellProps } from './types'

export const OrderDetailShell = ({
  orderNumber,
  status,
  description,
  children,
}: OrderDetailShellProps) => (
  <PageContainer>
    <BackButton />

    <PageHeader
      title={orderNumber != null ? `Pedido #${orderNumber}` : 'Pedido'}
      description={description}
      action={<OrderStatusBadge status={status} />}
    />

    {children}
  </PageContainer>
)
