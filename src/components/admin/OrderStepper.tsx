import { Check, CircleX, Clock3, CreditCard } from 'lucide-react'
import { FULFILMENT_STEPS, fulfilmentIndex } from '../../constants/orderStatus'
import type { AdminOrderDetail, OrderStatus } from '../../types/api'
import { formatDateTime } from '../../utils/format'
import { shortDate, timeOfDay } from './dates'

const STEP_LABEL: Partial<Record<OrderStatus, string>> = {
  paid: 'Paid',
  processing: 'Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
}

/** Optional steps an admin may skip (processing → shipped, shipped → delivered). */
const OPTIONAL: OrderStatus[] = ['packed', 'out_for_delivery']

type StepState = 'done' | 'current' | 'upcoming' | 'skipped'

function stepTimes(order: AdminOrderDetail) {
  const times: Partial<Record<OrderStatus, string>> = {}
  for (const event of order.timeline ?? []) if (event.status) times[event.status] = event.createdAt
  if (!times.paid && order.paidAt) times.paid = order.paidAt
  if (!times.shipped && order.tracking?.shippedAt) times.shipped = order.tracking.shippedAt
  if (!times.delivered && order.tracking?.deliveredAt) times.delivered = order.tracking.deliveredAt
  return times
}

export function OrderStepper({ order }: { order: AdminOrderDetail }) {
  const times = stepTimes(order)
  const cancelled = order.status === 'cancelled'
  const unpaid = order.status === 'pending_payment' || order.status === 'payment_failed'
  // A cancelled order shows how far it got before it was stopped.
  const reached = cancelled
    ? Math.max(-1, ...FULFILMENT_STEPS.map((step, index) => (times[step] ? index : -1)))
    : fulfilmentIndex(order.status)

  const stateOf = (step: OrderStatus, index: number): StepState => {
    if (index < reached) return OPTIONAL.includes(step) && !times[step] ? 'skipped' : 'done'
    if (index === reached) return cancelled ? 'done' : order.status === 'delivered' ? 'done' : 'current'
    return 'upcoming'
  }

  return (
    <div className="px-5 py-5">
      {(cancelled || unpaid) && (
        <div
          className={`mb-5 flex items-start gap-3 rounded-2xl p-3.5 text-sm ring-1 ${
            cancelled
              ? 'bg-stone-50 text-stone-700 ring-stone-200 dark:bg-stone-800/60 dark:text-stone-200 dark:ring-stone-700'
              : order.status === 'payment_failed'
                ? 'bg-rose-50 text-rose-800 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-900'
                : 'bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:ring-amber-900'
          }`}
        >
          {cancelled ? <CircleX size={18} className="mt-0.5 shrink-0" aria-hidden /> : <CreditCard size={18} className="mt-0.5 shrink-0" aria-hidden />}
          <p>
            {cancelled
              ? <>This order was cancelled{order.cancelledAt ? <> on <strong>{formatDateTime(order.cancelledAt)}</strong></> : null}. Fulfilment stopped{reached >= 0 ? ` after “${STEP_LABEL[FULFILMENT_STEPS[reached]]}”` : ' before payment'}.</>
              : order.status === 'payment_failed'
                ? 'The payment failed. Nothing to fulfil until the customer pays.'
                : 'Waiting for the customer to complete payment. Fulfilment starts once it’s paid.'}
          </p>
        </div>
      )}

      <ol className="grid gap-0 sm:grid-cols-6" aria-label="Fulfilment progress">
        {FULFILMENT_STEPS.map((step, index) => {
          const state = stateOf(step, index)
          const time = times[step]
          const last = index === FULFILMENT_STEPS.length - 1
          const lineDone = index < reached
          return (
            <li
              key={step}
              aria-current={state === 'current' ? 'step' : undefined}
              className={`relative flex gap-3 pb-5 last:pb-0 sm:flex-col sm:items-center sm:gap-2 sm:pb-0 sm:text-center ${cancelled ? 'opacity-70' : ''}`}
            >
              {!last && (
                <span
                  aria-hidden
                  className={`absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 sm:left-[calc(50%+18px)] sm:top-[15px] sm:h-0.5 sm:w-[calc(100%-36px)] ${
                    lineDone ? 'bg-[#1f7a55] dark:bg-emerald-500' : 'bg-stone-200 dark:bg-stone-700'
                  }`}
                />
              )}
              <span
                className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ring-4 ring-white dark:ring-stone-900 ${
                  state === 'done'
                    ? 'bg-[#1f7a55] text-white dark:bg-emerald-500 dark:text-stone-950'
                    : state === 'current'
                      ? 'bg-[#D9B27C] text-[#173f32] shadow-[0_0_0_6px_rgba(217,178,124,0.25)]'
                      : state === 'skipped'
                        ? 'border-2 border-dashed border-stone-300 bg-white text-stone-400 dark:border-stone-600 dark:bg-stone-900'
                        : 'border-2 border-stone-200 bg-white text-stone-400 dark:border-stone-700 dark:bg-stone-900'
                }`}
              >
                {state === 'done' ? <Check size={15} strokeWidth={3} aria-hidden /> : state === 'current' ? <Clock3 size={14} aria-hidden /> : index + 1}
              </span>
              <span className="min-w-0 pt-1 sm:pt-0">
                <span className={`block text-sm font-semibold ${state === 'upcoming' || state === 'skipped' ? 'text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-stone-100'}`}>
                  {STEP_LABEL[step]}
                </span>
                <span className="block text-xs text-stone-500 dark:text-stone-400">
                  {state === 'skipped' ? 'Skipped' : time && state !== 'upcoming' ? <><span>{shortDate(time)}</span><span className="sm:block"> {timeOfDay(time)}</span></> : state === 'current' ? 'In progress' : ' '}
                </span>
                <span className="sr-only">{state === 'done' ? '(completed)' : state === 'current' ? '(current step)' : state === 'skipped' ? '(skipped)' : '(not yet)'}</span>
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
