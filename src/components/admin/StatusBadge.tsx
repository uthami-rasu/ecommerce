import {
  ORDER_STATUS_LABEL, ORDER_STATUS_TONE, PAYMENT_STATUS_LABEL, STATUS_TONE_CLASS, type StatusTone,
} from '../../constants/orderStatus'
import type { OrderStatus, PaymentStatus } from '../../types/api'

const DOT: Record<StatusTone, string> = {
  neutral: 'bg-stone-400',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  progress: 'bg-violet-500',
  success: 'bg-emerald-500',
}

function Badge({ tone, children, size = 'md' }: { tone: StatusTone; children: string; size?: 'sm' | 'md' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-semibold ring-1 ring-inset ${STATUS_TONE_CLASS[tone]} ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <span aria-hidden className={`size-1.5 rounded-full ${DOT[tone]}`} />
      {children}
    </span>
  )
}

/** "Paid" in the admin means "new — needs confirming", so say so. */
const ADMIN_LABEL: Partial<Record<OrderStatus, string>> = { paid: 'New' }

/** `plain` uses the customer-facing label (e.g. on the timeline, where "Paid" is history, not a to-do). */
export function OrderStatusBadge({ status, size, plain }: { status: OrderStatus; size?: 'sm' | 'md'; plain?: boolean }) {
  return <Badge tone={ORDER_STATUS_TONE[status]} size={size}>{(!plain && ADMIN_LABEL[status]) || ORDER_STATUS_LABEL[status]}</Badge>
}

const PAYMENT_TONE: Record<PaymentStatus, StatusTone> = { created: 'neutral', pending: 'warning', succeeded: 'success', failed: 'danger' }

export function PaymentBadge({ status, size }: { status: PaymentStatus | null; size?: 'sm' | 'md' }) {
  if (!status) return <Badge tone="neutral" size={size}>Unpaid</Badge>
  return <Badge tone={PAYMENT_TONE[status]} size={size}>{PAYMENT_STATUS_LABEL[status]}</Badge>
}

export function StatusDot({ status }: { status: OrderStatus }) {
  return <span aria-hidden className={`inline-block size-2 shrink-0 rounded-full ${DOT[ORDER_STATUS_TONE[status]]}`} />
}
