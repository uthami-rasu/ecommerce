import type { OrderStatus, PaymentStatus } from '../types/api'

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: 'Awaiting payment',
  payment_failed: 'Payment failed',
  paid: 'Paid',
  processing: 'Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

/** Tone for badges: maps to colour classes in the UI. */
export type StatusTone = 'neutral' | 'warning' | 'danger' | 'info' | 'progress' | 'success'

export const ORDER_STATUS_TONE: Record<OrderStatus, StatusTone> = {
  pending_payment: 'warning',
  payment_failed: 'danger',
  paid: 'info',
  processing: 'info',
  packed: 'progress',
  shipped: 'progress',
  out_for_delivery: 'progress',
  delivered: 'success',
  cancelled: 'neutral',
}

/** Tailwind classes per tone (light + dark). */
export const STATUS_TONE_CLASS: Record<StatusTone, string> = {
  neutral: 'bg-stone-100 text-stone-600 ring-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-700',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900',
  danger: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-900',
  info: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-900',
  progress: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-900',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900',
}

/** The happy path a paid order walks through, in order (used for progress trackers). */
export const FULFILMENT_STEPS: OrderStatus[] = ['paid', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered']

/** Index of the status on the fulfilment path; -1 when off-path (unpaid / cancelled). */
export const fulfilmentIndex = (status: OrderStatus) => FULFILMENT_STEPS.indexOf(status)

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  created: 'Not paid',
  pending: 'Confirming',
  succeeded: 'Paid',
  failed: 'Failed',
}

export const SHIPPING_METHOD_LABEL = { standard: 'Standard', express: 'Express', pickup: 'Store pickup' } as const
