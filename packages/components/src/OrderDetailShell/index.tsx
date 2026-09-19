import { BackButton } from '../BackButton'
import { OrderStatusBadge } from '../OrderStatusBadge'
import { PageContainer } from '../PageContainer'
import { PageHeader } from '../PageHeader'
import type { OrderDetailShellProps } from './types'

export const OrderDetailShell = ({
  orderNumber,
  status,
  description,
  showBack = true,
  children,
}: OrderDetailShellProps) => (
  <PageContainer>
    {showBack ? <BackButton /> : null}

    <PageHeader
      title={orderNumber != null ? `Pedido #${orderNumber}` : 'Pedido'}
      description={description}
      action={<OrderStatusBadge status={status} />}
    />

    {children}
  </PageContainer>
)
