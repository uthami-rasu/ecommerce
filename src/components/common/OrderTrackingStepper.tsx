import { Check, XCircle } from 'lucide-react'
import type { OrderStatus } from '../../types/api'
import { formatDateTime } from '../../utils/format'

type TrackingStep = { key: string; label: string; statuses: OrderStatus[] }

/** One step per fulfilment status ("processing" is shown to customers as Confirmed). */
const STEPS: TrackingStep[] = [
  { key: 'placed', label: 'Order placed', statuses: ['paid'] },
  { key: 'confirmed', label: 'Confirmed', statuses: ['processing'] },
  { key: 'packed', label: 'Packed', statuses: ['packed'] },
  { key: 'shipped', label: 'Shipped', statuses: ['shipped'] },
  { key: 'out_for_delivery', label: 'Out for delivery', statuses: ['out_for_delivery'] },
  { key: 'delivered', label: 'Delivered', statuses: ['delivered'] },
]

/** Index of the last completed step; -1 = nothing done yet (awaiting payment). */
const completedIndex = (status: OrderStatus): number => STEPS.findIndex((step) => step.statuses.includes(status))

const shortDate = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

export interface OrderTrackingStepperProps {
  status: OrderStatus
  createdAt?: string
  paidAt?: string | null
  shippedAt?: string | null
  deliveredAt?: string | null
  cancelledAt?: string | null
  timeline?: Array<{ status?: OrderStatus | null; createdAt: string; title?: string }>
}

/** Fulfilment progress: a vertical list on phones, a row of steps from the `sm` breakpoint up. */
export function OrderTrackingStepper({ status, paidAt, shippedAt, deliveredAt, cancelledAt, timeline = [] }: OrderTrackingStepperProps) {
  const isCancelled = status === 'cancelled'
  const isFailed = status === 'payment_failed'
  // Steps up to and including the current status are done; the current one is highlighted.
  const done = isCancelled || isFailed ? -1 : completedIndex(status)
  const current = status === 'pending_payment' ? 0 : done

  // When each step happened: explicit dates first, then the first timeline event for that status.
  const times: Array<string | undefined> = STEPS.map((step) => {
    if (step.key === 'placed' && paidAt) return paidAt
    if (step.key === 'shipped' && shippedAt) return shippedAt
    if (step.key === 'delivered' && deliveredAt) return deliveredAt
    return timeline.find((event) => event.status && step.statuses.includes(event.status))?.createdAt
  })

  const state = (index: number) => (index <= done ? 'done' : index === current ? 'active' : 'todo')
  const dot = (index: number) => {
    const s = state(index)
    return (
      <span
        className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ring-4 ring-white dark:ring-stone-900 ${
          s === 'done'
            ? 'bg-[#1f7a55] text-white'
            : s === 'active'
              ? 'border-2 border-[#1f7a55] bg-white text-[#1f7a55] dark:bg-stone-900'
              : 'border-2 border-stone-300 bg-white text-stone-400 dark:border-stone-600 dark:bg-stone-900'
        }`}
        aria-hidden
      >
        {s === 'done' ? <Check size={14} strokeWidth={3} /> : s === 'active' ? <span className="size-2.5 rounded-full bg-[#1f7a55]" /> : index + 1}
      </span>
    )
  }
  const labelClass = (index: number) =>
    index === current ? 'font-bold text-[#1f7a55] dark:text-emerald-400' : state(index) === 'done' ? 'font-semibold text-stone-800 dark:text-stone-100' : 'font-medium text-stone-400'
  const srState = (index: number) => (index === current ? 'current step' : { done: 'completed', active: 'in progress', todo: 'not started' }[state(index)])

  return (
    <div className="w-full rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6">
      {(isCancelled || isFailed) && (
        <div className="mb-5 flex items-center gap-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900">
          <XCircle size={18} className="shrink-0" aria-hidden />
          <span>
            {isCancelled
              ? `This order was cancelled${cancelledAt ? ` on ${formatDateTime(cancelledAt)}` : ''}.`
              : 'Payment was unsuccessful. Fulfilment starts once payment is confirmed.'}
          </span>
        </div>
      )}
      {status === 'pending_payment' && (
        <p className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">Waiting for payment — fulfilment starts once it’s confirmed.</p>
      )}

      {/* Phones: vertical */}
      <ol className="grid sm:hidden" aria-label="Order progress">
        {STEPS.map((step, index) => (
          <li key={step.key} className="relative flex gap-4 pb-5 last:pb-0">
            {index < STEPS.length - 1 && (
              <span className={`absolute left-[15px] top-8 h-[calc(100%-2rem)] w-[3px] ${index < done ? 'bg-[#1f7a55]' : 'bg-stone-200 dark:bg-stone-700'}`} aria-hidden />
            )}
            {dot(index)}
            <div className="min-w-0 pt-1">
              <p className={`text-sm ${labelClass(index)}`}>
                {step.label}
                <span className="sr-only">, {srState(index)}</span>
              </p>
              {times[index] && <p className="text-xs text-stone-400">{shortDate(times[index]!)}</p>}
            </div>
          </li>
        ))}
      </ol>

      {/* Tablet and up: horizontal */}
      <ol className="hidden w-full items-start sm:flex" aria-label="Order progress">
        {STEPS.map((step, index) => (
          <li key={step.key} className="relative flex flex-1 flex-col items-center text-center">
            {index < STEPS.length - 1 && (
              <span className={`absolute left-1/2 top-4 h-[3px] w-full -translate-y-1/2 ${index < done ? 'bg-[#1f7a55]' : 'bg-stone-200 dark:bg-stone-700'}`} aria-hidden />
            )}
            {dot(index)}
            <p className={`mt-3 px-1 text-xs ${labelClass(index)}`}>
              {step.label}
              <span className="sr-only">, {srState(index)}</span>
            </p>
            {times[index] && <p className="mt-0.5 px-1 text-[10px] leading-tight text-stone-400">{shortDate(times[index]!)}</p>}
          </li>
        ))}
      </ol>
    </div>
  )
}
