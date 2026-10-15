import { CheckCircle2, CircleSlash, Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { AdminOrderDetail, OrderStatus } from '../../types/api'
import { formatDateTime, formatRelative } from '../../utils/format'
import { TRANSITION_META } from './orderActions'
import { btn, card } from './styles'
import { TransitionDialog } from './TransitionDialog'

function context(order: AdminOrderDetail) {
  const carrier = order.tracking?.carrier
  switch (order.status) {
    case 'pending_payment':
      return 'The customer hasn’t paid yet. Cancel it if the checkout was abandoned.'
    case 'payment_failed':
      return 'The payment failed. The customer can try again, or you can cancel the order.'
    case 'paid':
      return `Payment received ${order.paidAt ? formatRelative(order.paidAt) : ''}. Confirm the order to start preparing it.`
    case 'processing':
      return 'Confirmed. Pack the items next, or ship straight away.'
    case 'packed':
      return 'Packed and ready. Ship it once the courier has the parcel.'
    case 'shipped':
      return `On its way${carrier ? ` with ${carrier}` : ''}. Mark it out for delivery, or delivered once it arrives.`
    case 'out_for_delivery':
      return 'With the delivery agent. Mark it delivered once the customer has it.'
    case 'delivered':
      return `Delivered${order.tracking?.deliveredAt ? ` ${formatDateTime(order.tracking.deliveredAt)}` : ''}. Nothing left to do.`
    case 'cancelled':
      return `Cancelled${order.cancelledAt ? ` ${formatDateTime(order.cancelledAt)}` : ''}. Nothing left to do.`
  }
}

export function ActionPanel({ order }: { order: AdminOrderDetail }) {
  const [target, setTarget] = useState<OrderStatus | null>(null)
  const forward = order.allowedTransitions.filter((status) => status !== 'cancelled' && TRANSITION_META[status])
  const canCancel = order.allowedTransitions.includes('cancelled')
  const [primary, ...secondary] = forward
  const done = !order.allowedTransitions.length
  const PrimaryIcon = primary ? TRANSITION_META[primary]!.icon : null

  return (
    <section
      aria-labelledby={`actions-${order.id}`}
      className={`${card} overflow-hidden ${!done && order.status === 'paid' ? 'ring-2 !ring-[#D9B27C]' : ''}`}
    >
      <div className="bg-gradient-to-br from-[#f3efe4] to-white px-5 pb-5 pt-4 dark:from-[#14301f] dark:to-stone-900">
        <h2 id={`actions-${order.id}`} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-[#aa753a] dark:text-amber-400">
          {done ? (order.status === 'cancelled' ? <CircleSlash size={14} aria-hidden /> : <CheckCircle2 size={14} aria-hidden />) : <Sparkles size={14} aria-hidden />}
          {done ? 'Order closed' : 'Next step'}
        </h2>
        <p className="mt-2 text-sm text-stone-700 dark:text-stone-300">{context(order)}</p>

        {primary && PrimaryIcon && (
          <button type="button" className={`${btn.primary} mt-4 w-full !py-3 text-[15px]`} onClick={() => setTarget(primary)}>
            <PrimaryIcon size={18} aria-hidden /> {TRANSITION_META[primary]!.label}
          </button>
        )}
        {secondary.length > 0 && (
          <div className="mt-2 grid gap-2">
            {secondary.map((status) => {
              const meta = TRANSITION_META[status]!
              return (
                <button key={status} type="button" className={`${btn.secondary} w-full`} onClick={() => setTarget(status)}>
                  <meta.icon size={16} aria-hidden /> {status === 'shipped' ? 'Skip packing · ship now' : status === 'delivered' ? 'Mark delivered now' : meta.label}
                </button>
              )
            })}
          </div>
        )}
        {canCancel && (
          <button type="button" className={`${btn.dangerGhost} mt-2 w-full`} onClick={() => setTarget('cancelled')}>
            Cancel order
          </button>
        )}
      </div>
      {target && <TransitionDialog order={order} target={target} onClose={() => setTarget(null)} />}
    </section>
  )
}
