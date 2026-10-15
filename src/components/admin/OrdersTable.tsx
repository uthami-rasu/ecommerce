import { ChevronRight } from 'lucide-react'
import type { AdminOrderListItem, OrderStatus } from '../../types/api'
import { formatMoney } from '../../utils/format'
import { navigate } from '../../utils/router'
import { calendarDaysFromToday, etaPhrase, shortDate, timeOfDay } from './dates'
import { PRIMARY_NEXT, TRANSITION_META } from './orderActions'
import { OrderStatusBadge, PaymentBadge } from './StatusBadge'
import { btn } from './styles'
import { Skeleton } from './ui'

export function EtaText({ order }: { order: Pick<AdminOrderListItem, 'status' | 'tracking'> }) {
  const tracking = order.tracking
  if (order.status === 'delivered') {
    return <span className="text-emerald-700 dark:text-emerald-400">Delivered{tracking?.deliveredAt ? ` ${shortDate(tracking.deliveredAt)}` : ''}</span>
  }
  if (order.status === 'cancelled' || !tracking?.estimatedDeliveryAt) return <span className="text-stone-400 dark:text-stone-500">—</span>
  const late = calendarDaysFromToday(tracking.estimatedDeliveryAt) < 0
  return (
    <span className="flex flex-col leading-tight">
      <span className={`font-medium ${late ? 'text-rose-700 dark:text-rose-300' : 'text-stone-800 dark:text-stone-200'}`}>{etaPhrase(tracking.estimatedDeliveryAt)}</span>
      <span className="text-xs text-stone-500 dark:text-stone-400">{shortDate(tracking.estimatedDeliveryAt)}</span>
    </span>
  )
}

function QuickAction({ order, onAction }: { order: AdminOrderListItem; onAction: (order: AdminOrderListItem, target: OrderStatus) => void }) {
  const target = PRIMARY_NEXT[order.status]
  const meta = target ? TRANSITION_META[target] : undefined
  if (!target || !meta) return null
  const Icon = meta.icon
  return (
    <button
      type="button"
      className={order.status === 'paid' ? btn.smallPrimary : btn.small}
      onClick={(event) => {
        event.stopPropagation()
        onAction(order, target)
      }}
      aria-label={`${meta.label}: ${order.orderNumber}`}
    >
      <Icon size={13} aria-hidden /> {meta.short}
    </button>
  )
}

const detailHref = (order: AdminOrderListItem) => `#admin/orders/${order.id}`

export function OrdersTable({ orders, onAction, fetching }: {
  orders: AdminOrderListItem[]
  onAction: (order: AdminOrderListItem, target: OrderStatus) => void
  fetching?: boolean
}) {
  return (
    <div className={`transition-opacity ${fetching ? 'opacity-60' : ''}`} aria-busy={fetching}>
      {/* Desktop table */}
      <div className="hidden lg:block">
        <table className="w-full text-sm">
          <caption className="sr-only">Orders</caption>
          <thead>
            <tr className="border-b border-stone-100 text-left text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:border-stone-800 dark:text-stone-400">
              <th scope="col" className="py-3 pl-5 pr-3 font-semibold">Order</th>
              <th scope="col" className="px-3 py-3 font-semibold">Customer</th>
              <th scope="col" className="px-3 py-3 text-right font-semibold">Items</th>
              <th scope="col" className="px-3 py-3 text-right font-semibold">Total</th>
              <th scope="col" className="px-3 py-3 font-semibold">Payment</th>
              <th scope="col" className="px-3 py-3 font-semibold">Status</th>
              <th scope="col" className="px-3 py-3 font-semibold">ETA</th>
              <th scope="col" className="py-3 pl-3 pr-5 text-right font-semibold"><span className="sr-only">Next step</span></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                onClick={() => navigate(`admin/orders/${order.id}`)}
                className="group cursor-pointer border-b border-stone-100 transition-colors last:border-0 hover:bg-[#faf7f0] dark:border-stone-800/80 dark:hover:bg-stone-800/40"
              >
                <td className="py-3 pl-5 pr-3 align-middle">
                  <a href={detailHref(order)} onClick={(event) => event.stopPropagation()} className="font-semibold text-[#173f32] underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:text-emerald-300">
                    {order.orderNumber}
                  </a>
                  <p className="mt-0.5 text-xs text-stone-500 tabular-nums dark:text-stone-400">{shortDate(order.createdAt)}, {timeOfDay(order.createdAt)}</p>
                </td>
                <td className="max-w-[220px] px-3 py-3">
                  <p className="truncate font-medium text-stone-900 dark:text-stone-100">{order.customerName || 'Guest'}</p>
                  <p className="truncate text-xs text-stone-500 dark:text-stone-400">{order.contactEmail}</p>
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-stone-600 dark:text-stone-300">{order.itemCount}</td>
                <td className="px-3 py-3 text-right font-semibold tabular-nums text-stone-900 dark:text-stone-100">{formatMoney(order.total)}</td>
                <td className="px-3 py-3"><PaymentBadge status={order.paymentStatus} size="sm" /></td>
                <td className="px-3 py-3"><OrderStatusBadge status={order.status} size="sm" /></td>
                <td className="px-3 py-3 text-sm"><EtaText order={order} /></td>
                <td className="py-3 pl-3 pr-5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <QuickAction order={order} onAction={onAction} />
                    <ChevronRight size={16} aria-hidden className="text-stone-300 transition-transform group-hover:translate-x-0.5 dark:text-stone-600" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet cards */}
      <ul className="divide-y divide-stone-100 lg:hidden dark:divide-stone-800">
        {orders.map((order) => (
          <li key={order.id} className="relative px-4 py-4 transition-colors hover:bg-[#faf7f0] sm:px-5 dark:hover:bg-stone-800/40">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <a href={detailHref(order)} className="font-semibold text-[#173f32] after:absolute after:inset-0 focus-visible:outline-none dark:text-emerald-300">
                  {order.orderNumber}
                </a>
                <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{shortDate(order.createdAt)}, {timeOfDay(order.createdAt)}</p>
              </div>
              <p className="text-right font-semibold tabular-nums">{formatMoney(order.total)}</p>
            </div>
            <p className="mt-2 truncate text-sm text-stone-700 dark:text-stone-300">
              {order.customerName || 'Guest'} <span className="text-stone-400">·</span> <span className="text-stone-500 dark:text-stone-400">{order.contactEmail}</span>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={order.status} size="sm" />
              <PaymentBadge status={order.paymentStatus} size="sm" />
              <span className="text-xs text-stone-500 dark:text-stone-400">{order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}</span>
            </div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div className="text-xs">
                {(order.status === 'delivered' || (order.status !== 'cancelled' && order.tracking?.estimatedDeliveryAt)) && (
                  <><span className="text-stone-400">ETA </span><EtaText order={order} /></>
                )}
              </div>
              <div className="relative z-10"><QuickAction order={order} onAction={onAction} /></div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function OrdersTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y divide-stone-100 dark:divide-stone-800" aria-hidden>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-4 px-5 py-4">
          <div className="w-32 space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-20" /></div>
          <div className="flex-1 space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-52 max-w-full" /></div>
          <Skeleton className="hidden h-4 w-16 sm:block" />
          <Skeleton className="hidden h-6 w-20 rounded-full md:block" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      ))}
    </div>
  )
}
