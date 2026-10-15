import { ORDER_STATUS_TONE } from '../../constants/orderStatus'
import type { Order, OrderEvent } from '../../types/api'
import { formatDateTime, formatRelative } from '../../utils/format'
import { activity } from './orderTimeline'

const DOT: Record<string, string> = {
  neutral: 'bg-stone-400',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  progress: 'bg-violet-500',
  success: 'bg-emerald-500',
  note: 'bg-[#D9B27C]',
}

const ACTOR: Record<OrderEvent['actor'], string> = { customer: 'You', system: 'Bossco', admin: 'Bossco team' }

/** Vertical activity feed of order events, newest first. */
export function OrderTimeline({ order }: { order: Order }) {
  const events = activity(order)
  return (
    <ol className="relative">
      {events.map((event, index) => {
        const tone = event.status ? ORDER_STATUS_TONE[event.status] : 'note'
        const latest = index === 0
        return (
          <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
            {index < events.length - 1 && <span aria-hidden className="absolute bottom-0 left-[7px] top-5 w-px bg-stone-200 dark:bg-stone-800" />}
            <span aria-hidden className={`relative mt-1 size-[15px] flex-none rounded-full ring-4 ${latest ? 'ring-[#D9B27C]/25' : 'ring-white dark:ring-stone-900'} ${DOT[tone]}`} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p className={`text-sm font-bold ${latest ? 'text-[#173f32] dark:text-stone-50' : 'text-stone-700 dark:text-stone-200'}`}>{event.title}</p>
                <time dateTime={event.createdAt} title={formatDateTime(event.createdAt)} className="text-xs text-stone-400">
                  {formatRelative(event.createdAt)}
                </time>
              </div>
              {event.note && <p className="mt-1 whitespace-pre-line rounded-xl bg-stone-50 px-3 py-2 text-[13px] leading-relaxed text-stone-600 dark:bg-stone-800/60 dark:text-stone-300">{event.note}</p>}
              <p className="mt-1 text-xs text-stone-400">{formatDateTime(event.createdAt)} · {ACTOR[event.actor]}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
