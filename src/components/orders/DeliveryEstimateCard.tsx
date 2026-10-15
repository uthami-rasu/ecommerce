import { CalendarCheck2, CalendarClock, CircleDollarSign, PackageCheck, Store, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Order } from '../../types/api'
import { daysFromToday, formatLongDay, isPayable, relativeDay } from './orderHelpers'

type Content = { icon: ReactNode; eyebrow: string; title: string; detail: string; tone: string }

function describe(order: Order): Content {
  const { tracking } = order
  if (order.status === 'delivered') {
    const when = tracking?.deliveredAt
    return {
      icon: <PackageCheck size={20} />, eyebrow: 'Delivered', tone: 'from-emerald-500/15 to-emerald-500/0 text-emerald-700 dark:text-emerald-300',
      title: when ? formatLongDay(when) : 'Your order has arrived',
      detail: when ? `Delivered ${relativeDay(when)} at ${new Date(when).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}` : 'Enjoy! We’d love to hear what you think.',
    }
  }
  if (order.status === 'cancelled') {
    return {
      icon: <XCircle size={20} />, eyebrow: 'Cancelled', tone: 'from-stone-400/20 to-stone-400/0 text-stone-600 dark:text-stone-300',
      title: 'This order won’t be delivered',
      detail: order.paidAt ? 'Questions about your refund? Our team is happy to help.' : 'No payment was taken for this order.',
    }
  }
  if (isPayable(order.status)) {
    return {
      icon: <CircleDollarSign size={20} />, eyebrow: 'Awaiting payment', tone: 'from-amber-500/15 to-amber-500/0 text-amber-700 dark:text-amber-300',
      title: 'Complete payment to confirm',
      detail: 'We start packing as soon as your payment is confirmed.',
    }
  }
  const eta = tracking?.estimatedDeliveryAt
  if (eta) {
    const late = daysFromToday(eta) < 0
    return {
      icon: <CalendarCheck2 size={20} />, eyebrow: order.status === 'out_for_delivery' ? 'Out for delivery' : 'Estimated delivery',
      tone: 'from-[#D9B27C]/25 to-[#D9B27C]/0 text-[#8a6430] dark:text-amber-200',
      title: formatLongDay(eta),
      detail: late ? 'Running a little late — it’s on its way.' : `Arriving ${relativeDay(eta)}`,
    }
  }
  if (order.shippingMethod === 'pickup') {
    return {
      icon: <Store size={20} />, eyebrow: 'Store pickup', tone: 'from-sky-500/15 to-sky-500/0 text-sky-700 dark:text-sky-300',
      title: 'We’re getting it ready', detail: 'We’ll email you when your order is ready to collect.',
    }
  }
  return {
    icon: <CalendarClock size={20} />, eyebrow: 'Preparing your order', tone: 'from-sky-500/15 to-sky-500/0 text-sky-700 dark:text-sky-300',
    title: 'Freshly packing your order', detail: 'You’ll get a delivery date as soon as it ships.',
  }
}

/** Big "when will it arrive" card. */
export function DeliveryEstimateCard({ order }: { order: Order }) {
  const content = describe(order)
  return (
    <section aria-label="Delivery estimate" className={`relative overflow-hidden rounded-3xl border border-stone-200/80 bg-gradient-to-br ${content.tone} bg-white p-6 shadow-[0_18px_45px_-28px_rgba(23,63,50,0.35)] dark:border-stone-800 dark:bg-stone-900`}>
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em]">
        <span aria-hidden>{content.icon}</span> {content.eyebrow}
      </p>
      <p className="mt-3 font-display text-[2rem] font-bold leading-tight text-[#173f32] dark:text-stone-50">{content.title}</p>
      <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">{content.detail}</p>
    </section>
  )
}
