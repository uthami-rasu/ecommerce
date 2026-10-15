import { ArrowRight, CheckCircle2, Clock, Mail, PackageSearch } from 'lucide-react'
import { CheckoutShell } from '../../components/checkout/CheckoutShell'
import { ProductThumb } from '../../components/checkout/ProductThumb'
import { Skeleton } from '../../components/checkout/Skeleton'
import { OrderNotFound } from '../../components/orders/OrderNotFound'
import { isNotFound, isPayable, paymentMethodLabel } from '../../components/orders/orderHelpers'
import { SHIPPING_METHOD_LABEL } from '../../constants/orderStatus'
import { useGetOrderQuery } from '../../features/orders/ordersApi'
import { errorMessage } from '../../lib/http/apiClient'
import type { Order } from '../../types/api'
import { formatDate, formatMoney } from '../../utils/format'

export function OrderCompletePage({ orderNumber }: { orderNumber: string }) {
  const { data: order, isLoading, error, refetch } = useGetOrderQuery(orderNumber, { skip: !orderNumber, refetchOnMountOrArgChange: true })

  let content
  if (isLoading) content = <CompleteSkeleton />
  else if (!order) {
    content = isNotFound(error) || !orderNumber
      ? <OrderNotFound orderNumber={orderNumber} />
      : <OrderNotFound orderNumber={orderNumber} error={errorMessage(error)} onRetry={refetch} />
  } else content = <ThankYou order={order} />

  return (
    <CheckoutShell title="Complete!" step={3} width="narrow">
      {content}
    </CheckoutShell>
  )
}

function ThankYou({ order }: { order: Order }) {
  const unpaid = isPayable(order.status)
  const rows: Array<[string, string]> = [
    ['Order code', order.orderNumber],
    ['Date', formatDate(order.createdAt, { day: 'numeric', month: 'long', year: 'numeric' })],
    ['Total', formatMoney(order.total)],
    ['Payment method', unpaid ? 'Not paid yet' : paymentMethodLabel],
    ['Delivery', SHIPPING_METHOD_LABEL[order.shippingMethod]],
  ]

  return (
    <section className="checkout-fade-in relative mx-auto max-w-xl overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white/90 px-6 py-10 text-center shadow-[0_35px_80px_-40px_rgba(23,63,50,0.5)] backdrop-blur-xl sm:px-12 sm:py-12 dark:border-stone-800 dark:bg-stone-900/85">
      <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 size-64 -translate-x-1/2 rounded-full bg-[#D9B27C]/25 blur-3xl dark:bg-amber-300/10" />
      {unpaid ? (
        <span className="relative mx-auto grid size-16 place-items-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          <Clock size={30} aria-hidden />
        </span>
      ) : (
        <span className="gateway-pop relative mx-auto grid size-16 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_18px_40px_-12px_rgba(16,185,129,0.7)]">
          <CheckCircle2 size={32} aria-hidden />
        </span>
      )}
      <p className="relative mt-5 text-sm font-semibold text-stone-500 dark:text-stone-400">{unpaid ? 'Almost there' : 'Thank you! 🎉'}</p>
      <h2 className="relative mt-2 font-display text-[2.4rem] font-bold leading-[1.02] text-[#173f32] sm:text-[2.8rem] dark:text-stone-50">
        {unpaid ? <>Your order is waiting<br />for payment</> : <>Your order has been<br />received</>}
      </h2>

      <ul className="relative mt-8 flex flex-wrap justify-center gap-4" aria-label="Items in this order">
        {order.items.map((item) => (
          <li key={item.id} className="relative">
            <a href={`#product/${item.productSlug}`} className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173f32]">
              <ProductThumb src={item.imageUrl} alt={`${item.productName} (${item.variantLabel})`} className="size-20 shadow-md" />
            </a>
            <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-stone-900 text-[11px] font-bold text-white ring-2 ring-white dark:bg-amber-300 dark:text-stone-900 dark:ring-stone-900">
              {item.quantity}
              <span className="sr-only"> × {item.productName}</span>
            </span>
          </li>
        ))}
      </ul>

      <dl className="relative mx-auto mt-8 max-w-sm divide-y divide-stone-100 text-left text-sm dark:divide-stone-800">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-6 py-2.5">
            <dt className="text-stone-500 dark:text-stone-400">{label}</dt>
            <dd className={`text-right font-bold text-stone-800 dark:text-stone-100 ${label === 'Order code' ? 'font-mono tracking-wide' : ''}`}>{value}</dd>
          </div>
        ))}
      </dl>

      {!unpaid && (
        <p className="relative mx-auto mt-5 flex max-w-sm items-center justify-center gap-2 text-xs text-stone-500 dark:text-stone-400">
          <Mail size={14} className="flex-none" aria-hidden /> A confirmation is on its way to <b className="truncate font-semibold text-stone-700 dark:text-stone-200">{order.contactEmail}</b>
        </p>
      )}

      <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        {unpaid ? (
          <a href={`#pay/${order.orderNumber}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#173f32] px-7 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#1e5040] dark:bg-amber-300 dark:text-stone-900">
            Complete payment <ArrowRight size={15} aria-hidden />
          </a>
        ) : (
          <a href={`#orders/${order.orderNumber}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#173f32] px-7 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#1e5040] dark:bg-amber-300 dark:text-stone-900">
            <PackageSearch size={16} aria-hidden /> Track your order
          </a>
        )}
        <a href="#shop" className="inline-flex items-center justify-center rounded-full bg-[#D9B27C] px-7 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#c9a068]">
          Continue shopping
        </a>
      </div>
      <a href="#account/orders" className="relative mt-5 inline-block text-xs font-bold text-stone-500 underline-offset-4 hover:underline dark:text-stone-400">Purchase history</a>
    </section>
  )
}

function CompleteSkeleton() {
  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-stone-200 bg-white/80 px-10 py-12 dark:border-stone-800 dark:bg-stone-900/70" role="status" aria-label="Loading order">
      <Skeleton className="mx-auto size-16 rounded-full" />
      <Skeleton className="mx-auto mt-6 h-10 w-3/4" />
      <div className="mt-8 flex justify-center gap-4">
        <Skeleton className="size-20 rounded-2xl" />
        <Skeleton className="size-20 rounded-2xl" />
      </div>
      <div className="mx-auto mt-8 max-w-sm space-y-3">
        {[0, 1, 2, 3].map((key) => <Skeleton key={key} className="h-4" />)}
      </div>
    </div>
  )
}
