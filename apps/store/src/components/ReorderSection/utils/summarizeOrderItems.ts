import type { HomeFeedReorder } from '@repo/domain'

export const summarizeOrderItems = (
  order: Pick<HomeFeedReorder, 'items'>,
  maxItems = 2,
): string => {
  const visible = order.items.slice(0, maxItems).map((item) => `${item.quantity} × ${item.name}`)
  const remaining = order.items.length - visible.length
  return [...visible, remaining > 0 ? `+${remaining} más` : null].filter(Boolean).join(' · ')
}
