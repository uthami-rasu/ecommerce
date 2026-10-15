import { Copy, ExternalLink, Pencil, Truck } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { useUpdateOrderTrackingMutation } from '../../features/admin/adminApi'
import type { AdminOrderDetail, TrackingInput } from '../../types/api'
import { formatDateTime } from '../../utils/format'
import { calendarDaysFromToday, etaPhrase, weekdayDate } from './dates'
import { btn, input, label } from './styles'
import { TrackingFields } from './TrackingFields'
import { draftFromTracking, trackingChanges, trackingErrors } from './tracking'
import { Card, CardHeader, DetailRow, InlineError, Spinner, Switch } from './ui'

const copy = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value)
    toast.success('Tracking number copied')
  } catch {
    toast.error('Couldn’t copy. Select the number and copy it manually.')
  }
}

function EditTracking({ order, onDone }: { order: AdminOrderDetail; onDone: () => void }) {
  const formId = useId()
  const [draft, setDraft] = useState(() => draftFromTracking(order.tracking))
  const [note, setNote] = useState('')
  const [notify, setNotify] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [updateTracking, { isLoading, error, reset }] = useUpdateOrderTrackingMutation()

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setLocalError(null)
    if (Object.keys(trackingErrors(draft)).length) return
    const changes = trackingChanges(draft, order.tracking)
    if (!Object.keys(changes).length) {
      setLocalError('Nothing changed yet. Edit a field, or close the form.')
      return
    }
    reset()
    try {
      // `null` clears a stored value; the API accepts it although the shared input type only lists strings.
      await updateTracking({ id: order.id, ...(changes as TrackingInput), ...(note.trim() ? { note: note.trim() } : {}), notifyCustomer: notify }).unwrap()
      toast.success('Tracking updated', { description: notify ? `We emailed ${order.contactEmail}.` : undefined })
      onDone()
    } catch {
      // Shown inline.
    }
  }

  return (
    <form id={formId} onSubmit={submit} className="grid gap-4 px-5 py-5" noValidate>
      <TrackingFields value={draft} onChange={setDraft} disabled={isLoading} etaHint="No expected delivery date set." />
      <div>
        <label className={label} htmlFor={`${formId}-note`}>Note <span className="font-normal text-stone-400">(optional)</span></label>
        <input id={`${formId}-note`} className={input} value={note} maxLength={500} onChange={(event) => setNote(event.target.value)} placeholder="e.g. Courier changed after a delay" disabled={isLoading} />
      </div>
      <Switch checked={notify} onChange={setNotify} label="Email the customer" hint="Off by default for small corrections." disabled={isLoading} />
      {localError && <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">{localError}</p>}
      <InlineError error={error} />
      <div className="flex justify-end gap-2">
        <button type="button" className={btn.ghost} onClick={onDone} disabled={isLoading}>Cancel</button>
        <button type="submit" className={btn.primary} disabled={isLoading}>
          {isLoading && <Spinner />} {isLoading ? 'Saving…' : 'Save tracking'}
        </button>
      </div>
    </form>
  )
}

export function TrackingCard({ order }: { order: AdminOrderDetail }) {
  const [editing, setEditing] = useState(false)
  const tracking = order.tracking
  const hasAny = Boolean(tracking && (tracking.carrier || tracking.trackingNumber || tracking.trackingUrl || tracking.estimatedDeliveryAt || tracking.shippedAt))
  const editable = !['pending_payment', 'payment_failed', 'cancelled'].includes(order.status)
  const eta = tracking?.estimatedDeliveryAt
  const late = eta && order.status !== 'delivered' ? calendarDaysFromToday(eta) < 0 : false

  return (
    <Card aria-labelledby={`tracking-${order.id}`}>
      <CardHeader
        id={`tracking-${order.id}`}
        title="Shipment & tracking"
        icon={Truck}
        action={editable && !editing ? (
          <button type="button" className={btn.small} onClick={() => setEditing(true)}>
            <Pencil size={13} aria-hidden /> {hasAny ? 'Edit tracking' : 'Add tracking'}
          </button>
        ) : undefined}
      />
      {editing ? (
        <EditTracking order={order} onDone={() => setEditing(false)} />
      ) : hasAny && tracking ? (
        <dl className="px-5 py-3">
          {tracking.carrier && <DetailRow label="Courier">{tracking.carrier}</DetailRow>}
          {tracking.trackingNumber && (
            <DetailRow label="Tracking no.">
              <span className="inline-flex items-center gap-1.5">
                <span className="break-all font-mono text-[13px]">{tracking.trackingNumber}</span>
                <button type="button" className={`${btn.icon} !size-7`} onClick={() => copy(tracking.trackingNumber!)} aria-label="Copy tracking number">
                  <Copy size={13} aria-hidden />
                </button>
              </span>
            </DetailRow>
          )}
          {tracking.trackingUrl && (
            <DetailRow label="Link">
              <a href={tracking.trackingUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-[#173f32] underline underline-offset-2 dark:text-emerald-300">
                Track parcel <ExternalLink size={12} aria-hidden />
              </a>
            </DetailRow>
          )}
          {eta && order.status !== 'delivered' && (
            <DetailRow label="Expected">
              <span className={late ? 'text-rose-700 dark:text-rose-300' : ''}>{etaPhrase(eta)}</span>
              <span className="block text-xs font-normal text-stone-500 dark:text-stone-400">{weekdayDate(eta)}</span>
            </DetailRow>
          )}
          {tracking.shippedAt && <DetailRow label="Shipped">{formatDateTime(tracking.shippedAt)}</DetailRow>}
          {tracking.deliveredAt && <DetailRow label="Delivered">{formatDateTime(tracking.deliveredAt)}</DetailRow>}
        </dl>
      ) : (
        <p className="px-5 py-5 text-sm text-stone-500 dark:text-stone-400">
          {editable ? 'Courier, tracking number and delivery date are added when you ship the order.' : 'This order won’t ship.'}
        </p>
      )}
    </Card>
  )
}
