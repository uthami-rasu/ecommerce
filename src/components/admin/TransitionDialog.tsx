import { AlertTriangle } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { ORDER_STATUS_LABEL, SHIPPING_METHOD_LABEL } from '../../constants/orderStatus'
import { useAppDispatch } from '../../app/hooks'
import { adminApi, useUpdateOrderStatusMutation } from '../../features/admin/adminApi'
import { isApiError } from '../../lib/http/apiClient'
import type { OrderStatus, OrderTracking, PaymentStatus, ShippingMethod } from '../../types/api'
import { formatMoney } from '../../utils/format'
import { Dialog } from './Dialog'
import { TRANSITION_META } from './orderActions'
import { btn, input, label } from './styles'
import { TrackingFields } from './TrackingFields'
import { draftFromTracking, trackingErrors, trackingInput } from './tracking'
import { InlineError, Spinner, Switch } from './ui'

export type TransitionOrder = {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: PaymentStatus | null
  total: number
  contactEmail: string
  shippingMethod?: ShippingMethod
  tracking?: OrderTracking | null
}

const DEFAULT_DAYS: Record<ShippingMethod, number> = { express: 2, standard: 5, pickup: 1 }

const EMAIL_SUBJECT: Partial<Record<OrderStatus, string>> = {
  shipped: '“Your order is on its way” with the tracking details',
  out_for_delivery: '“Out for delivery today”',
  delivered: '“Your order was delivered”',
  cancelled: '“Your order was cancelled”',
}

export function TransitionDialog({ order, target, onClose }: { order: TransitionOrder; target: OrderStatus; onClose: () => void }) {
  const meta = TRANSITION_META[target]
  const formId = useId()
  const [note, setNote] = useState('')
  const [notify, setNotify] = useState(true)
  const [confirmed, setConfirmed] = useState(false)
  const [draft, setDraft] = useState(() => draftFromTracking(order.tracking))
  const [submitted, setSubmitted] = useState(false)
  const [updateStatus, { isLoading, error, reset }] = useUpdateOrderStatusMutation()
  const dispatch = useAppDispatch()

  if (!meta) return null
  const Icon = meta.icon
  const isShip = target === 'shipped'
  const isCancel = target === 'cancelled'
  const wasPaid = order.paymentStatus === 'succeeded'
  const invalid = (isShip && Object.keys(trackingErrors(draft)).length > 0) || note.length > 500 || (isCancel && !confirmed)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    if (invalid) return
    reset()
    try {
      await updateStatus({
        id: order.id,
        status: target,
        ...(isShip ? trackingInput(draft) : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
        notifyCustomer: meta.emails ? notify : false,
      }).unwrap()
      toast.success(isCancel ? `Order ${order.orderNumber} cancelled` : `Order ${order.orderNumber} is now ${ORDER_STATUS_LABEL[target].toLowerCase()}`, {
        description: meta.emails && notify ? `We emailed ${order.contactEmail}.` : undefined,
      })
      onClose()
    } catch (caught) {
      // Shown inline below. On a conflict the cached order is stale: refetch it behind the dialog.
      if (isApiError(caught) && caught.status === 409) {
        dispatch(adminApi.util.invalidateTags([{ type: 'AdminOrder', id: order.id }, 'AdminOrders', 'Dashboard']))
      }
    }
  }

  const conflict = isApiError(error) && error.status === 409

  return (
    <Dialog
      title={meta.title}
      description={<>Order <span className="font-semibold text-stone-700 dark:text-stone-200">{order.orderNumber}</span> · {meta.description}</>}
      icon={<Icon size={20} aria-hidden />}
      tone={isCancel ? 'danger' : 'default'}
      onClose={onClose}
      busy={isLoading}
      footer={
        <>
          <button type="button" className={btn.secondary} onClick={onClose} disabled={isLoading}>
            {isCancel ? 'Keep order' : 'Back'}
          </button>
          <button type="submit" form={formId} className={isCancel ? btn.danger : btn.primary} disabled={isLoading || (submitted && invalid) || (isCancel && !confirmed)}>
            {isLoading ? <Spinner /> : <Icon size={16} aria-hidden />}
            {isLoading ? 'Saving…' : meta.label}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} className="grid gap-5 pt-1" noValidate>
        {isCancel && (
          <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:ring-amber-900">
            <p className="flex items-center gap-2 font-semibold"><AlertTriangle size={16} aria-hidden /> Before you cancel</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-900/90 dark:text-amber-100/90">
              <li>Items go back into stock and any coupon is released.</li>
              {wasPaid
                ? <li>The customer paid <strong>{formatMoney(order.total)}</strong>. Refunds are <strong>not automatic</strong>, so issue it yourself from the payment provider.</li>
                : <li>No payment was taken for this order.</li>}
              <li>This can’t be undone.</li>
            </ul>
            <label className="mt-3 flex cursor-pointer items-center gap-2.5 font-medium">
              <input
                type="checkbox"
                className="size-4 rounded border-amber-400 accent-rose-600"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
              />
              Yes, cancel order {order.orderNumber}
            </label>
          </div>
        )}

        {isShip && (
          <TrackingFields
            value={draft}
            onChange={setDraft}
            disabled={isLoading}
            etaHint={order.shippingMethod
              ? `Leave empty to use the ${SHIPPING_METHOD_LABEL[order.shippingMethod].toLowerCase()} default (${DEFAULT_DAYS[order.shippingMethod]} ${DEFAULT_DAYS[order.shippingMethod] === 1 ? 'day' : 'days'}).`
              : 'Leave empty to use the shipping method’s default.'}
          />
        )}

        <div>
          <label className={label} htmlFor={`${formId}-note`}>
            {isCancel ? 'Reason' : 'Note'} <span className="font-normal text-stone-400">(optional)</span>
          </label>
          <textarea
            id={`${formId}-note`}
            className={`${input} min-h-20 resize-y`}
            value={note}
            maxLength={500}
            onChange={(event) => setNote(event.target.value)}
            placeholder={isCancel ? 'e.g. Customer asked to cancel by phone' : isShip ? 'e.g. Shipped in two boxes' : 'Anything worth recording'}
            aria-describedby={`${formId}-note-help`}
            disabled={isLoading}
          />
          <p id={`${formId}-note-help`} className="mt-1 flex justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>Saved on the order timeline. The customer can see it.</span>
            <span className="tabular-nums">{note.length}/500</span>
          </p>
        </div>

        {meta.emails ? (
          <Switch
            checked={notify}
            onChange={setNotify}
            label="Email the customer"
            hint={<>Sends {EMAIL_SUBJECT[target] ?? 'an update'} to {order.contactEmail}.</>}
            disabled={isLoading}
          />
        ) : (
          <p className="text-xs text-stone-500 dark:text-stone-400">No email is sent for this step. The customer sees it on their order page.</p>
        )}

        <InlineError
          error={conflict && isApiError(error)
            ? { status: 409, message: `This order changed in the meantime, so the step wasn’t applied (${error.message}). Close this dialog to see its latest status.` }
            : error}
        />
      </form>
    </Dialog>
  )
}
