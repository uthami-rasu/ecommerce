import { CreditCard, Mail, MapPin, MessageSquareText, Package, Phone, UserRound } from 'lucide-react'
import { SHIPPING_METHOD_LABEL } from '../../constants/orderStatus'
import type { AdminOrderDetail, OrderAddress } from '../../types/api'
import { formatAddress, formatDateTime, formatMoney, fullName } from '../../utils/format'
import { PaymentBadge } from './StatusBadge'
import { Card, CardHeader, DetailRow } from './ui'

export function ItemsCard({ order }: { order: AdminOrderDetail }) {
  return (
    <Card aria-labelledby={`items-${order.id}`}>
      <CardHeader id={`items-${order.id}`} title={`Items (${order.itemCount})`} icon={Package} />
      <ul className="divide-y divide-stone-100 dark:divide-stone-800">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3.5 px-5 py-3.5">
            <span className="size-14 shrink-0 overflow-hidden rounded-xl bg-[#f4efe4] ring-1 ring-stone-200/70 dark:bg-stone-800 dark:ring-stone-700">
              {item.imageUrl ? <img src={item.imageUrl} alt="" className="size-full object-cover" loading="lazy" /> : <Package size={20} aria-hidden className="m-auto mt-4 text-stone-400" />}
            </span>
            <div className="min-w-0 flex-1">
              <a href={`#product/${item.productSlug}`} className="block truncate text-sm font-semibold text-stone-900 hover:underline dark:text-stone-100">{item.productName}</a>
              <p className="text-xs text-stone-500 dark:text-stone-400">{item.variantLabel} · <span className="font-mono">{item.sku}</span></p>
              <p className="mt-0.5 text-xs text-stone-500 tabular-nums sm:hidden dark:text-stone-400">{item.quantity} × {formatMoney(item.unitPrice)}</p>
            </div>
            <p className="hidden w-28 text-right text-sm text-stone-500 tabular-nums sm:block dark:text-stone-400">{item.quantity} × {formatMoney(item.unitPrice)}</p>
            <p className="w-20 text-right text-sm font-semibold tabular-nums">{formatMoney(item.lineTotal)}</p>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export function PaymentCard({ order }: { order: AdminOrderDetail }) {
  return (
    <Card aria-labelledby={`payment-${order.id}`}>
      <CardHeader id={`payment-${order.id}`} title="Payment" icon={CreditCard} action={<PaymentBadge status={order.paymentStatus} size="sm" />} />
      <dl className="px-5 py-3">
        <DetailRow label="Subtotal">{formatMoney(order.subtotal)}</DetailRow>
        {order.discount > 0 && (
          <DetailRow label={order.couponCode ? `Discount (${order.couponCode})` : 'Discount'}>
            <span className="text-emerald-700 dark:text-emerald-400">−{formatMoney(order.discount)}</span>
          </DetailRow>
        )}
        <DetailRow label={`Shipping · ${SHIPPING_METHOD_LABEL[order.shippingMethod] ?? order.shippingMethod}`}>
          {order.shippingFee ? formatMoney(order.shippingFee) : 'Free'}
        </DetailRow>
        <div className="mt-1.5 flex items-baseline justify-between border-t border-stone-100 pt-2.5 dark:border-stone-800">
          <dt className="text-sm font-semibold">Total</dt>
          <dd className="text-lg font-semibold tabular-nums">{formatMoney(order.total)}</dd>
        </div>
        <DetailRow label="Paid">{order.paidAt ? formatDateTime(order.paidAt) : <span className="text-stone-400">Not paid</span>}</DetailRow>
        {order.status === 'cancelled' && order.paymentStatus === 'succeeded' && (
          <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:ring-amber-900">
            Cancelled after payment: refund {formatMoney(order.total)} from the payment provider (refunds aren’t automatic).
          </p>
        )}
      </dl>
    </Card>
  )
}

function AddressBlock({ title, address }: { title: string; address: OrderAddress }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">{title}</p>
      <address className="mt-1.5 text-sm not-italic leading-relaxed text-stone-800 dark:text-stone-200">
        <span className="font-semibold">{fullName(address)}</span>
        <br />
        {formatAddress(address)}
        {address.phone && (
          <>
            <br />
            <a href={`tel:${address.phone.replace(/\s+/g, '')}`} className="text-[#173f32] hover:underline dark:text-emerald-300">{address.phone}</a>
          </>
        )}
      </address>
    </div>
  )
}

const sameAddress = (a: OrderAddress, b: OrderAddress) =>
  (['firstName', 'lastName', 'phone', 'line1', 'line2', 'city', 'state', 'postalCode', 'country'] as const).every((key) => (a[key] ?? '') === (b[key] ?? ''))

export function CustomerCard({ order }: { order: AdminOrderDetail }) {
  const customer = order.customer
  const phone = customer?.phone || order.shippingAddress.phone
  const name = customer ? fullName(customer) : fullName(order.shippingAddress)
  return (
    <Card aria-labelledby={`customer-${order.id}`}>
      <CardHeader id={`customer-${order.id}`} title="Customer" icon={UserRound} />
      <div className="grid gap-4 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{name || 'Guest'}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">{customer ? 'Registered customer' : 'Guest checkout'}</p>
          <div className="mt-2 grid gap-1.5 text-sm">
            <a href={`mailto:${order.contactEmail}?subject=${encodeURIComponent(`Your Bossco order ${order.orderNumber}`)}`} className="inline-flex min-w-0 items-center gap-2 text-[#173f32] hover:underline dark:text-emerald-300">
              <Mail size={14} aria-hidden className="shrink-0" /> <span className="truncate">{order.contactEmail}</span>
            </a>
            {phone && (
              <a href={`tel:${phone.replace(/\s+/g, '')}`} className="inline-flex items-center gap-2 text-[#173f32] hover:underline dark:text-emerald-300">
                <Phone size={14} aria-hidden /> {phone}
              </a>
            )}
          </div>
        </div>
        <div className="flex items-start gap-2 border-t border-stone-100 pt-4 dark:border-stone-800">
          <MapPin size={15} aria-hidden className="mt-0.5 shrink-0 text-[#aa753a] dark:text-amber-400" />
          <div className="grid flex-1 gap-4">
            <AddressBlock title="Ship to" address={order.shippingAddress} />
            {sameAddress(order.shippingAddress, order.billingAddress) ? (
              <p className="text-xs text-stone-500 dark:text-stone-400">Billing address is the same.</p>
            ) : (
              <AddressBlock title="Bill to" address={order.billingAddress} />
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export function CustomerNote({ note }: { note: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-950 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-100 dark:ring-amber-900">
      <MessageSquareText size={17} aria-hidden className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-300" />
      <div>
        <p className="font-semibold">Note from the customer</p>
        <p className="mt-1 whitespace-pre-line break-words">{note}</p>
      </div>
    </div>
  )
}
