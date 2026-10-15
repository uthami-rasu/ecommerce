import { useState } from 'react'
import { ChevronLeft, ChevronRight, CreditCard, PackageOpen, RefreshCw, Truck } from 'lucide-react'
import { useGetOrdersQuery } from '../../features/orders/ordersApi'
import { errorMessage } from '../../lib/http/apiClient'
import type { Order } from '../../types/api'
import { formatDate, formatMoney } from '../../utils/format'
import { Skeleton } from '../checkout/Skeleton'
import { ItemThumbs } from './ItemThumbs'
import { etaLabel, isPayable } from './orderHelpers'
import { OrderStatusBadge } from './OrderStatusBadge'
import '../../styles/checkout.css'

const PAGE_SIZE = 10

/** The signed-in customer's orders, newest first, 10 per page. Rendered inside the account page. */
export function OrderHistory() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isFetching, error, refetch } = useGetOrdersQuery({ page, limit: PAGE_SIZE }, { refetchOnMountOrArgChange: 30 })

  if (isLoading) return <HistorySkeleton />
  if (error && !data) {
    return (
      <div className="order-history rounded-3xl border border-rose-200 bg-rose-50/80 px-6 py-10 text-center dark:border-rose-900 dark:bg-rose-950/30" role="alert">
        <h3 className="text-lg font-bold text-rose-800 dark:text-rose-200">We couldn’t load your orders</h3>
        <p className="mt-1 text-sm text-rose-700/80 dark:text-rose-300/80">{errorMessage(error)}</p>
        <button type="button" onClick={refetch} className="mt-5 inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700">
          <RefreshCw size={14} aria-hidden /> Try again
        </button>
      </div>
    )
  }
  if (!data || data.meta.total === 0) return <NoOrders />

  const { meta } = data
  const first = (meta.page - 1) * meta.limit + 1
  const last = Math.min(meta.total, meta.page * meta.limit)

  return (
    <div className="order-history grid gap-4">
      <p className="text-sm text-stone-500 dark:text-stone-400" aria-live="polite">
        {meta.total === 1 ? '1 order' : `Showing ${first}–${last} of ${meta.total} orders`}
      </p>
      <ul className={`grid gap-3 transition-opacity ${isFetching ? 'opacity-60' : ''}`} aria-busy={isFetching}>
        {data.data.map((order) => <OrderRow key={order.id} order={order} />)}
      </ul>
      {meta.totalPages > 1 && (
        <nav className="mt-2 flex items-center justify-between gap-3" aria-label="Order pages">
          <button type="button" onClick={() => setPage((current) => current - 1)} disabled={meta.page <= 1 || isFetching} className={pagerButton}>
            <ChevronLeft size={15} aria-hidden /> Newer
          </button>
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Page {meta.page} of {meta.totalPages}</span>
          <button type="button" onClick={() => setPage((current) => current + 1)} disabled={meta.page >= meta.totalPages || isFetching} className={pagerButton}>
            Older <ChevronRight size={15} aria-hidden />
          </button>
        </nav>
      )}
    </div>
  )
}

const pagerButton =
  'inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-700 transition hover:border-stone-300 focus-visible:outline-2 focus-visible:outline-[#173f32] disabled:cursor-not-allowed disabled:opacity-40 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200'

function OrderRow({ order }: { order: Order }) {
  const eta = etaLabel(order)
  const payable = isPayable(order.status)
  const firstItem = order.items[0]
  return (
    <li className="group relative rounded-3xl border border-stone-200/80 bg-white/90 p-4 shadow-[0_12px_32px_-24px_rgba(23,63,50,0.4)] transition hover:border-stone-300 hover:shadow-[0_18px_40px_-24px_rgba(23,63,50,0.5)] sm:p-5 dark:border-stone-800 dark:bg-stone-900/80 dark:hover:border-stone-700">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_164px_minmax(0,1fr)_auto] md:items-center md:gap-6">
        <div className="flex items-start justify-between gap-3 md:block">
          <div className="min-w-0">
            <a href={`#orders/${order.orderNumber}`} className="font-mono text-sm font-bold tracking-wide text-[#173f32] after:absolute after:inset-0 after:rounded-3xl hover:underline focus-visible:outline-none focus-visible:after:ring-4 focus-visible:after:ring-[#D9B27C]/40 dark:text-amber-200">
              {order.orderNumber}
            </a>
            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">Placed {formatDate(order.createdAt)}</p>
          </div>
          <OrderStatusBadge status={order.status} className="md:mt-2" />
        </div>

        <div className="flex items-center gap-3">
          <ItemThumbs items={order.items} />
          <p className="min-w-0 text-xs text-stone-500 md:hidden dark:text-stone-400">
            {firstItem?.productName}
            {order.items.length > 1 && ` + ${order.items.length - 1} more`}
          </p>
        </div>

        <div className="min-w-0 text-sm">
          <p className="font-bold tabular-nums text-stone-800 dark:text-stone-100">
            {formatMoney(order.total)}
            <span className="ml-1.5 text-xs font-normal text-stone-400">· {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}</span>
          </p>
          {eta ? (
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300"><Truck size={13} aria-hidden /> {eta}</p>
          ) : order.status === 'delivered' && order.tracking?.deliveredAt ? (
            <p className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">Delivered {formatDate(order.tracking.deliveredAt, { day: 'numeric', month: 'short' })}</p>
          ) : (
            <p className="mt-1 hidden truncate text-xs text-stone-400 md:block">
              {firstItem?.productName}
              {order.items.length > 1 && ` + ${order.items.length - 1} more`}
            </p>
          )}
        </div>

        <div className="relative z-10 flex flex-wrap gap-2 md:justify-end">
          {payable && (
            <a href={`#pay/${order.orderNumber}`} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#173f32] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#1e5040] md:flex-none dark:bg-amber-300 dark:text-stone-900">
              <CreditCard size={13} aria-hidden /> Pay now
            </a>
          )}
          <a href={`#orders/${order.orderNumber}`} className="inline-flex flex-1 items-center justify-center rounded-full border border-stone-200 px-4 py-2 text-xs font-bold text-stone-700 transition hover:border-stone-400 md:flex-none dark:border-stone-700 dark:text-stone-200">
            View &amp; track
          </a>
        </div>
      </div>
    </li>
  )
}

function NoOrders() {
  return (
    <div className="grid place-items-center rounded-3xl border border-dashed border-stone-300 bg-white/70 px-6 py-14 text-center dark:border-stone-700 dark:bg-stone-900/60">
      <span className="grid size-14 place-items-center rounded-full bg-[#173f32]/8 text-[#173f32] dark:bg-amber-300/10 dark:text-amber-200">
        <PackageOpen size={26} aria-hidden />
      </span>
      <h3 className="mt-4 font-display text-2xl font-bold text-[#173f32] dark:text-stone-50">No orders yet</h3>
      <p className="mt-1 max-w-xs text-sm text-stone-500 dark:text-stone-400">When you place an order, you’ll be able to track it here.</p>
      <a href="#shop" className="mt-6 rounded-full bg-[#173f32] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1e5040] dark:bg-amber-300 dark:text-stone-900">Start shopping</a>
    </div>
  )
}

function HistorySkeleton() {
  return (
    <div className="grid gap-3" role="status" aria-label="Loading orders">
      {[0, 1, 2].map((key) => (
        <div key={key} className="flex flex-wrap items-center gap-6 rounded-3xl border border-stone-200/80 bg-white/80 p-5 dark:border-stone-800 dark:bg-stone-900/70">
          <div className="space-y-2"><Skeleton className="h-4 w-36" /><Skeleton className="h-3 w-24" /></div>
          <div className="flex gap-2"><Skeleton className="size-12 rounded-2xl" /><Skeleton className="size-12 rounded-2xl" /></div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="ml-auto h-8 w-28 rounded-full" />
        </div>
      ))}
    </div>
  )
}
