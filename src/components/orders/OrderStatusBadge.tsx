import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE, STATUS_TONE_CLASS } from '../../constants/orderStatus'
import type { OrderStatus } from '../../types/api'

/** Pill with the customer-facing label and tone colour for an order status. */
export function OrderStatusBadge({ status, className = '' }: { status: OrderStatus; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${STATUS_TONE_CLASS[ORDER_STATUS_TONE[status]]} ${className}`}>
      <span aria-hidden className="size-1.5 rounded-full bg-current opacity-70" />
      {ORDER_STATUS_LABEL[status]}
    </span>
  )
}
