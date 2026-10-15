import type { ApiErrorShape } from '../../lib/http/apiClient'
import { isApiError } from '../../lib/http/apiClient'
import type { Order, OrderStatus } from '../../types/api'

/** Orders the customer can still pay for. */
export const PAYABLE_STATUSES: OrderStatus[] = ['pending_payment', 'payment_failed']
export const isPayable = (status: OrderStatus) => PAYABLE_STATUSES.includes(status)

/** Customers may cancel only before payment succeeds. */
export const isCancellable = isPayable

/** Paid and moving through fulfilment: worth polling for updates. */
export const ACTIVE_STATUSES: OrderStatus[] = ['paid', 'processing', 'packed', 'shipped', 'out_for_delivery']
export const isActive = (status: OrderStatus) => ACTIVE_STATUSES.includes(status)

export const isNotFound = (error: unknown) => isApiError(error) && ((error as ApiErrorShape).status === 404 || (error as ApiErrorShape).status === 400)

/** "Fri, 17 Oct" */
export const formatShortDay = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })

/** "Friday, 17 October" */
export const formatLongDay = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

/** Whole calendar days from today until the date: 0 today, 1 tomorrow, negative in the past. */
export const daysFromToday = (iso: string) => {
  const target = new Date(iso)
  const today = new Date()
  const startOf = (date: Date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.round((startOf(target) - startOf(today)) / 86_400_000)
}

/** "today", "tomorrow", "in 3 days", "2 days ago". */
export const relativeDay = (iso: string) => {
  const days = daysFromToday(iso)
  if (days === 0) return 'today'
  if (days === 1) return 'tomorrow'
  if (days === -1) return 'yesterday'
  return days > 1 ? `in ${days} days` : `${-days} days ago`
}

/** The ETA line for shipped orders ("Arriving by Fri, 17 Oct"), or null. */
export const etaLabel = (order: Pick<Order, 'status' | 'tracking'>) => {
  const eta = order.tracking?.estimatedDeliveryAt
  if (!eta || !['shipped', 'out_for_delivery', 'packed', 'processing', 'paid'].includes(order.status)) return null
  return order.status === 'out_for_delivery' ? `Arriving ${relativeDay(eta) === 'today' ? 'today' : `by ${formatShortDay(eta)}`}` : `Arriving by ${formatShortDay(eta)}`
}

export const paymentMethodLabel = 'Card · Test mode'
