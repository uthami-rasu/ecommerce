import { Check, ClipboardCheck, House, Package, ReceiptText, Truck, Bike, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { FULFILMENT_STEPS, ORDER_STATUS_LABEL } from '../../constants/orderStatus'
import type { Order, OrderStatus } from '../../types/api'
import { formatDate } from '../../utils/format'
import { stepTimestamp, reachedIndex } from './orderTimeline'

const STEP_ICON: Partial<Record<OrderStatus, LucideIcon>> = {
  paid: ReceiptText,
  processing: ClipboardCheck,
  packed: Package,
  shipped: Truck,
  out_for_delivery: Bike,
  delivered: House,
}

const stepLabel = (status: OrderStatus) => (status === 'paid' ? 'Order placed' : ORDER_STATUS_LABEL[status])

/**
 * Placed → Confirmed → Packed → Shipped → Out for delivery → Delivered.
 * Horizontal from md up, vertical on phones; a cancelled order freezes where it stopped.
 */
export function OrderProgress({ order }: { order: Order }) {
  const cancelled = order.status === 'cancelled'
  const current = reachedIndex(order)
  const last = FULFILMENT_STEPS.length - 1

  return (
    <div>
      <ol className="relative grid gap-0 md:flex md:items-start" aria-label="Order progress">
        {FULFILMENT_STEPS.map((status, index) => {
          const done = index < current || (index === current && status === 'delivered')
          const isCurrent = index === current && !done && !cancelled
          const reached = index <= current
          const Icon = STEP_ICON[status] ?? Check
          const time = reached ? stepTimestamp(order, status) : null
          const lineFilled = index < current
          return (
            <li
              key={status}
              aria-current={isCurrent ? 'step' : undefined}
              className="relative flex gap-4 pb-5 last:pb-0 md:flex-1 md:flex-col md:items-center md:pb-0 md:text-center"
            >
              {index < last && (
                <span
                  aria-hidden
                  className={`absolute left-[17px] top-10 -bottom-0 w-0.5 rounded-full md:left-[calc(50%+26px)] md:right-[calc(-50%+26px)] md:top-[17px] md:bottom-auto md:h-0.5 md:w-auto ${
                    lineFilled ? (cancelled ? 'bg-stone-400 dark:bg-stone-600' : 'bg-emerald-500') : 'bg-stone-200 dark:bg-stone-800'
                  }`}
                />
              )}
              <span
                className={`relative z-10 grid size-9 flex-none place-items-center rounded-full transition ${
                  done
                    ? cancelled ? 'bg-stone-400 text-white dark:bg-stone-600' : 'bg-emerald-500 text-white shadow-[0_8px_18px_-8px_rgba(16,185,129,0.8)]'
                    : isCurrent
                      ? 'tracker-current bg-[#173f32] text-[#f6e9cd] shadow-[0_10px_22px_-10px_rgba(23,63,50,0.9)] dark:bg-amber-300 dark:text-stone-900'
                      : reached && cancelled
                        ? 'bg-stone-400 text-white dark:bg-stone-600'
                        : 'border-2 border-stone-200 bg-white text-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-600'
                }`}
              >
                {done ? <Check size={16} strokeWidth={3} aria-hidden /> : <Icon size={16} aria-hidden />}
              </span>
              <div className="min-w-0 pt-1.5 md:px-1 md:pt-3">
                <p className={`text-sm font-bold ${reached ? 'text-stone-800 dark:text-stone-100' : 'text-stone-400 dark:text-stone-500'}`}>
                  {stepLabel(status)}
                  <span className="sr-only">{done ? ' — completed' : isCurrent ? ' — current step' : ''}</span>
                </p>
                <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                  {time ? formatDate(time, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : isCurrent ? 'In progress' : reached ? 'Done' : ' '}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
      {cancelled && (
        <p className="mt-6 flex items-center gap-2 rounded-2xl bg-stone-100 px-4 py-3 text-sm font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
          <XCircle size={16} className="flex-none text-rose-500" aria-hidden />
          This order was cancelled{order.cancelledAt ? ` on ${formatDate(order.cancelledAt, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}` : ''}.
        </p>
      )}
    </div>
  )
}
