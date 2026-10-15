import { Bot, MessageSquarePlus, ShieldCheck, Send, User } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { ORDER_STATUS_LABEL } from '../../constants/orderStatus'
import { useAddOrderEventMutation } from '../../features/admin/adminApi'
import type { AdminOrderDetail, OrderEvent } from '../../types/api'
import { formatDateTime, formatRelative } from '../../utils/format'
import { OrderStatusBadge } from './StatusBadge'
import { btn, input, label } from './styles'
import { InlineError, Spinner, Switch } from './ui'

const ACTOR = {
  system: { label: 'System', icon: Bot, className: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300' },
  customer: { label: 'Customer', icon: User, className: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300' },
  admin: { label: 'Store team', icon: ShieldCheck, className: 'bg-[#eef4ef] text-[#173f32] dark:bg-emerald-950/60 dark:text-emerald-300' },
} satisfies Record<OrderEvent['actor'], unknown>

const TITLE_SUGGESTIONS = ['In transit', 'Arrived at hub', 'Delayed', 'Delivery attempted', 'Shipment update', 'Message from the store']

export function PostUpdateForm({ order }: { order: AdminOrderDetail }) {
  const id = useId()
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [notify, setNotify] = useState(false)
  const [touched, setTouched] = useState(false)
  const [addEvent, { isLoading, error, reset }] = useAddOrderEventMutation()
  const noteError = note.trim().length < 3 ? 'Write at least 3 characters' : null

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setTouched(true)
    if (noteError) return
    reset()
    try {
      await addEvent({ id: order.id, note: note.trim(), ...(title.trim() ? { title: title.trim() } : {}), notifyCustomer: notify }).unwrap()
      toast.success('Update posted', { description: notify ? `We emailed ${order.contactEmail}.` : 'Visible on the customer’s order page.' })
      setTitle('')
      setNote('')
      setTouched(false)
    } catch {
      // Shown inline.
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-3 rounded-2xl bg-[#faf7f0] p-4 ring-1 ring-stone-200/70 dark:bg-stone-950/50 dark:ring-stone-800">
      <p className="flex items-center gap-2 text-sm font-semibold text-stone-900 dark:text-stone-100">
        <MessageSquarePlus size={16} aria-hidden className="text-[#aa753a] dark:text-amber-400" /> Post an update
      </p>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,14rem)_1fr]">
        <div>
          <label className={label} htmlFor={`${id}-title`}>Title <span className="font-normal text-stone-400">(optional)</span></label>
          <input id={`${id}-title`} className={input} list={`${id}-titles`} value={title} maxLength={120} onChange={(event) => setTitle(event.target.value)} placeholder="Shipment update" disabled={isLoading} />
          <datalist id={`${id}-titles`}>{TITLE_SUGGESTIONS.map((item) => <option key={item} value={item} />)}</datalist>
        </div>
        <div>
          <label className={label} htmlFor={`${id}-note`}>Update</label>
          <textarea
            id={`${id}-note`}
            className={`${input} min-h-[42px] resize-y`}
            rows={2}
            value={note}
            maxLength={500}
            onChange={(event) => setNote(event.target.value)}
            onBlur={() => note && setTouched(true)}
            placeholder="e.g. Arrived at the Chennai hub"
            aria-invalid={touched && Boolean(noteError)}
            aria-describedby={`${id}-note-help`}
            disabled={isLoading}
            required
          />
          <p id={`${id}-note-help`} className={`mt-1 flex justify-between text-xs ${touched && noteError ? 'text-rose-600 dark:text-rose-300' : 'text-stone-500 dark:text-stone-400'}`}>
            <span>{touched && noteError ? noteError : 'Shown on the customer’s order timeline.'}</span>
            <span className="tabular-nums">{note.length}/500</span>
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:max-w-xs sm:flex-1">
          <Switch checked={notify} onChange={setNotify} label="Email the customer" disabled={isLoading} />
        </div>
        <button type="submit" className={btn.primary} disabled={isLoading}>
          {isLoading ? <Spinner /> : <Send size={15} aria-hidden />} {isLoading ? 'Posting…' : 'Post update'}
        </button>
      </div>
      <InlineError error={error} />
    </form>
  )
}

export function OrderTimeline({ events }: { events: OrderEvent[] }) {
  if (!events.length) return <p className="py-6 text-center text-sm text-stone-500 dark:text-stone-400">No activity recorded yet.</p>
  const newestFirst = [...events].reverse()
  return (
    <ol className="relative">
      {newestFirst.map((event, index) => {
        const actor = ACTOR[event.actor] ?? ACTOR.system
        const last = index === newestFirst.length - 1
        return (
          <li key={event.id} className="relative flex gap-3.5 pb-5 last:pb-0">
            {!last && <span aria-hidden className="absolute left-[17px] top-10 h-[calc(100%-2.75rem)] w-px bg-stone-200 dark:bg-stone-700" />}
            <span className={`grid size-9 shrink-0 place-items-center rounded-full ${actor.className}`} title={actor.label}>
              <actor.icon size={16} aria-hidden />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{event.title}</p>
                {event.status && ORDER_STATUS_LABEL[event.status].toLowerCase() !== event.title.toLowerCase() && <OrderStatusBadge status={event.status} size="sm" plain />}
              </div>
              {event.note && <p className="mt-1 whitespace-pre-line break-words text-sm text-stone-600 dark:text-stone-300">{event.note}</p>}
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                <span className="font-medium">{actor.label}</span> · <time dateTime={event.createdAt} title={formatDateTime(event.createdAt)}>{formatDateTime(event.createdAt)}</time> · {formatRelative(event.createdAt)}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
