import { Check, XCircle } from 'lucide-react'
import type { OrderStatus } from '../../types/api'
import { formatDateTime } from '../../utils/format'

export type TrackingStep = {
  key: string
  label: string
  description?: string
  statusMapping: OrderStatus[]
}

export const TRACKING_7_STEPS: TrackingStep[] = [
  { key: 'placed', label: 'Order Placed', statusMapping: ['pending_payment', 'paid'] },
  { key: 'confirmed', label: 'Confirmed', statusMapping: ['processing'] },
  { key: 'processing', label: 'Processing', statusMapping: ['processing'] },
  { key: 'packed', label: 'Packed', statusMapping: ['packed'] },
  { key: 'shipped', label: 'Shipped', statusMapping: ['shipped'] },
  { key: 'out_for_delivery', label: 'Out for Delivery', statusMapping: ['out_for_delivery'] },
  { key: 'delivered', label: 'Delivered', statusMapping: ['delivered'] },
]

export function getStepIndex(status: OrderStatus): number {
  switch (status) {
    case 'pending_payment':
      return 0
    case 'paid':
      return 1 // Placed is done, Confirmed is in progress
    case 'processing':
      return 2 // Placed, Confirmed done, Processing active
    case 'packed':
      return 3 // Packed active
    case 'shipped':
      return 4 // Shipped active
    case 'out_for_delivery':
      return 5 // Out for delivery active
    case 'delivered':
      return 6 // Delivered (all 7 complete)
    case 'cancelled':
    case 'payment_failed':
      return -1
    default:
      return 0
  }
}

export interface OrderTrackingStepperProps {
  status: OrderStatus
  createdAt?: string
  paidAt?: string | null
  shippedAt?: string | null
  deliveredAt?: string | null
  cancelledAt?: string | null
  timeline?: Array<{ status?: OrderStatus | null; createdAt: string; title?: string }>
}

export function OrderTrackingStepper({
  status,
  paidAt,
  shippedAt,
  deliveredAt,
  cancelledAt,
  timeline = [],
}: OrderTrackingStepperProps) {
  const isCancelled = status === 'cancelled'
  const isFailed = status === 'payment_failed'
  const currentIndex = isCancelled || isFailed ? -1 : getStepIndex(status)
  const isDelivered = status === 'delivered'

  // Extract timestamps from timeline if available
  const timeMap: Record<number, string | undefined> = {
    0: paidAt ?? undefined,
    4: shippedAt ?? undefined,
    6: deliveredAt ?? undefined,
  }

  for (const item of timeline) {
    if (!item.status) continue
    const idx = getStepIndex(item.status)
    if (idx >= 0 && !timeMap[idx]) {
      timeMap[idx] = item.createdAt
    }
  }

  return (
    <div className="w-full rounded-2xl bg-white p-6 shadow-sm border border-stone-200/80">
      {(isCancelled || isFailed) && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
          <XCircle size={18} className="shrink-0 text-rose-600" />
          <span>
            {isCancelled
              ? `This order was cancelled${cancelledAt ? ` on ${formatDateTime(cancelledAt)}` : ''}. Fulfilment has ceased.`
              : 'Payment was unsuccessful. Fulfilment will begin once payment is confirmed.'}
          </span>
        </div>
      )}

      {/* Stepper container */}
      <div className="relative">
        <ol className="flex w-full items-start justify-between">
          {TRACKING_7_STEPS.map((step, idx) => {
            const isCompleted = isDelivered || (!isCancelled && !isFailed && idx < currentIndex)
            const isActive = !isCancelled && !isFailed && idx === currentIndex && !isDelivered

            const timestamp = timeMap[idx]

            return (
              <li
                key={step.key}
                className="relative flex flex-1 flex-col items-center text-center group"
              >
                {/* Horizontal connecting line to NEXT step */}
                {idx < TRACKING_7_STEPS.length - 1 && (
                  <div
                    className={`absolute top-4 left-1/2 w-full h-[3px] -translate-y-1/2 transition-colors z-0 ${
                      idx < currentIndex || (isDelivered && idx < 6)
                        ? 'bg-[#1f7a55]'
                        : 'bg-stone-200'
                    }`}
                  />
                )}

                {/* Step Circle */}
                <div
                  className={`relative z-10 flex size-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                    isCompleted
                      ? 'bg-[#1f7a55] text-white shadow-sm ring-4 ring-white'
                      : isActive
                        ? 'border-2 border-[#1f7a55] bg-white text-[#1f7a55] ring-4 ring-white ring-offset-0'
                        : 'border-2 border-stone-300 bg-white text-stone-400 ring-4 ring-white'
                  }`}
                >
                  {isCompleted ? (
                    <Check size={14} strokeWidth={3} className="text-white" />
                  ) : isActive ? (
                    <span className="size-2.5 rounded-full bg-[#1f7a55]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                {/* Step Title & Timestamp */}
                <div className="mt-3.5 flex flex-col items-center px-1">
                  <span
                    className={`text-xs font-semibold tracking-tight transition-colors whitespace-nowrap ${
                      isActive
                        ? 'text-[#1f7a55] font-bold'
                        : isCompleted
                          ? 'text-stone-800'
                          : 'text-stone-400'
                    }`}
                  >
                    {step.label}
                  </span>
                  {timestamp && (
                    <span className="mt-0.5 text-[10px] text-stone-400 font-normal">
                      {formatDateTime(timestamp)}
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
