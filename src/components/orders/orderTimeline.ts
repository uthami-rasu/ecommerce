import { FULFILMENT_STEPS, fulfilmentIndex } from '../../constants/orderStatus'
import type { Order, OrderEvent, OrderStatus } from '../../types/api'

/** When the order entered a status: latest matching timeline event, else the dedicated timestamp. */
export function stepTimestamp(order: Order, status: OrderStatus): string | null {
  const event = [...(order.timeline ?? [])].reverse().find((item) => item.status === status)
  if (event) return event.createdAt
  if (status === 'paid') return order.paidAt
  if (status === 'shipped') return order.tracking?.shippedAt ?? null
  if (status === 'delivered') return order.tracking?.deliveredAt ?? null
  return null
}

/** Furthest fulfilment step reached; for cancelled orders, where they stopped (-1 = never paid). */
export function reachedIndex(order: Order): number {
  const index = fulfilmentIndex(order.status)
  if (index >= 0) return index
  if (order.status !== 'cancelled') return -1
  const fromTimeline = Math.max(-1, ...(order.timeline ?? []).map((event) => (event.status ? FULFILMENT_STEPS.indexOf(event.status) : -1)))
  return Math.max(fromTimeline, order.paidAt ? 0 : -1)
}

/**
 * Activity feed, newest first. Before the timeline endpoint is available, it is rebuilt from the
 * order's own timestamps so the section is never empty.
 */
export function activity(order: Order): OrderEvent[] {
  if (order.timeline?.length) return [...order.timeline].reverse()
  const events: OrderEvent[] = [
    { id: 'placed', status: 'pending_payment', title: 'Order placed', note: null, actor: 'customer', createdAt: order.createdAt },
  ]
  if (order.paidAt) events.push({ id: 'paid', status: 'paid', title: 'Payment received', note: null, actor: 'system', createdAt: order.paidAt })
  if (order.tracking?.shippedAt) events.push({ id: 'shipped', status: 'shipped', title: 'Shipped', note: null, actor: 'admin', createdAt: order.tracking.shippedAt })
  if (order.tracking?.deliveredAt) events.push({ id: 'delivered', status: 'delivered', title: 'Delivered', note: null, actor: 'admin', createdAt: order.tracking.deliveredAt })
  if (order.cancelledAt) events.push({ id: 'cancelled', status: 'cancelled', title: 'Order cancelled', note: null, actor: 'system', createdAt: order.cancelledAt })
  return events.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
