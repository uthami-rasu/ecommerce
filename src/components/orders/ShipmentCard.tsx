import { Copy, ExternalLink, Truck } from 'lucide-react'
import { toast } from 'sonner'
import type { Order } from '../../types/api'
import { formatDateTime } from '../../utils/format'
import { Panel } from '../checkout/Panel'

const safeUrl = (url: string | null | undefined) => (url && /^https?:\/\//i.test(url) ? url : null)

/** Carrier + tracking number (copyable) + carrier link. */
export function ShipmentCard({ order }: { order: Order }) {
  const tracking = order.tracking
  const hasShipment = Boolean(tracking?.carrier || tracking?.trackingNumber)
  const trackingUrl = safeUrl(tracking?.trackingUrl)

  const copy = async () => {
    if (!tracking?.trackingNumber) return
    try {
      await navigator.clipboard.writeText(tracking.trackingNumber)
      toast.success('Tracking number copied')
    } catch {
      toast.error('Could not copy', { description: 'Select the number and copy it manually.' })
    }
  }

  return (
    <Panel title="Shipment" icon={<Truck size={17} />}>
      {hasShipment ? (
        <dl className="grid gap-3 text-sm">
          {tracking?.carrier && (
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500 dark:text-stone-400">Carrier</dt>
              <dd className="font-bold text-stone-800 dark:text-stone-100">{tracking.carrier}</dd>
            </div>
          )}
          {tracking?.trackingNumber && (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-stone-500 dark:text-stone-400">Tracking no.</dt>
              <dd className="flex min-w-0 items-center gap-1.5">
                <span className="truncate font-mono font-bold tracking-wide text-stone-800 dark:text-stone-100">{tracking.trackingNumber}</span>
                <button type="button" onClick={copy} aria-label="Copy tracking number" className="grid size-8 flex-none place-items-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-[#173f32] focus-visible:outline-2 focus-visible:outline-[#173f32] dark:hover:bg-stone-800 dark:hover:text-amber-200">
                  <Copy size={14} />
                </button>
              </dd>
            </div>
          )}
          {tracking?.shippedAt && (
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500 dark:text-stone-400">Shipped</dt>
              <dd className="text-right font-semibold text-stone-700 dark:text-stone-200">{formatDateTime(tracking.shippedAt)}</dd>
            </div>
          )}
          {trackingUrl && (
            <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl border border-[#173f32]/20 bg-[#173f32]/[0.04] px-4 py-3 text-sm font-bold text-[#173f32] transition hover:bg-[#173f32]/10 dark:border-amber-300/30 dark:bg-amber-300/5 dark:text-amber-200">
              Track with carrier <ExternalLink size={14} aria-hidden />
            </a>
          )}
        </dl>
      ) : (
        <p className="text-sm leading-relaxed text-stone-500 dark:text-stone-400">
          {order.status === 'cancelled'
            ? 'This order was cancelled before it shipped.'
            : order.shippingMethod === 'pickup'
              ? 'Store pickup — no courier needed. Bring your order number when you collect.'
              : 'Courier and tracking details will appear here once your parcel is handed over.'}
        </p>
      )}
    </Panel>
  )
}
