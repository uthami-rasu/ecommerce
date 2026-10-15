import { ArrowRight, CheckCircle2, ChevronRight, PackageOpen, Truck, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { ORDER_STATUS_LABEL } from '../../constants/orderStatus'
import type { AdminOrderListItem, OrderStatus } from '../../types/api'
import { formatMoney, formatRelative } from '../../utils/format'
import { OrderStatusBadge, StatusDot } from './StatusBadge'
import { card } from './styles'
import { Skeleton } from './ui'

export function KpiTile({ label, value, sub, icon: Icon, accent }: { label: string; value: ReactNode; sub?: ReactNode; icon: LucideIcon; accent?: boolean }) {
  return (
    <div className={`${card} relative overflow-hidden p-4 sm:p-5 ${accent ? '!bg-[#173f32] !ring-[#173f32] text-white dark:!bg-[#123528]' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <p className={`text-xs font-medium ${accent ? 'text-emerald-100/80' : 'text-stone-500 dark:text-stone-400'}`}>{label}</p>
        <Icon size={16} aria-hidden className={accent ? 'text-[#D9B27C]' : 'text-[#aa753a] dark:text-amber-400'} />
      </div>
      <p className={`mt-2 text-[1.6rem] font-semibold leading-none tracking-tight sm:text-[1.75rem] ${accent ? 'text-white' : 'text-stone-900 dark:text-stone-50'}`}>{value}</p>
      {sub && <p className={`mt-2 text-xs ${accent ? 'text-emerald-100/75' : 'text-stone-500 dark:text-stone-400'}`}>{sub}</p>}
    </div>
  )
}

export function KpiSkeleton() {
  return (
    <div className={`${card} p-5`} aria-hidden>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-7 w-28" />
      <Skeleton className="mt-3 h-3 w-20" />
    </div>
  )
}

type AttentionItem = { status: OrderStatus; title: string; hint: string; icon: LucideIcon; count: number; urgent?: boolean }

export function NeedsAttention({ counts }: { counts: Partial<Record<OrderStatus, number>> }) {
  const items: AttentionItem[] = [
    { status: 'paid', title: 'Confirm new orders', hint: 'Paid and waiting for you', icon: CheckCircle2, count: counts.paid ?? 0, urgent: true },
    { status: 'processing', title: 'Pack confirmed orders', hint: 'Confirmed, not packed yet', icon: PackageOpen, count: counts.processing ?? 0 },
    { status: 'packed', title: 'Ship packed orders', hint: 'Packed and ready for the courier', icon: Truck, count: counts.packed ?? 0 },
  ]
  const pending = items.filter((item) => item.count > 0)

  if (!pending.length) {
    return (
      <div className="flex flex-col items-center px-6 py-10 text-center">
        <span className="grid size-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">
          <CheckCircle2 size={22} aria-hidden />
        </span>
        <p className="mt-3 font-display text-2xl font-bold text-[#173f32] dark:text-stone-100">All caught up</p>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">No orders are waiting on you right now.</p>
      </div>
    )
  }

  return (
    <ul className="grid gap-2 p-3">
      {items.map((item) => (
        <li key={item.status}>
          <a
            href={`#admin/orders?status=${item.status}`}
            className={`group flex items-center gap-3 rounded-xl p-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              item.count > 0 && item.urgent
                ? 'bg-amber-50 ring-1 ring-amber-200 hover:bg-amber-100/70 dark:bg-amber-950/30 dark:ring-amber-900 dark:hover:bg-amber-950/50'
                : 'hover:bg-stone-50 dark:hover:bg-stone-800/50'
            } ${item.count === 0 ? 'opacity-60' : ''}`}
          >
            <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${item.count > 0 && item.urgent ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200' : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300'}`}>
              <item.icon size={17} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-stone-900 dark:text-stone-100">{item.title}</span>
              <span className="block text-xs text-stone-500 dark:text-stone-400">{item.hint}</span>
            </span>
            <span className="text-xl font-semibold tabular-nums text-stone-900 dark:text-stone-50">{item.count}</span>
            <ChevronRight size={16} aria-hidden className="text-stone-400 transition-transform group-hover:translate-x-0.5" />
          </a>
        </li>
      ))}
    </ul>
  )
}

const BREAKDOWN_ORDER: OrderStatus[] = ['pending_payment', 'paid', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'payment_failed']

export function StatusBreakdown({ counts }: { counts: Partial<Record<OrderStatus, number>> }) {
  const max = Math.max(1, ...BREAKDOWN_ORDER.map((status) => counts[status] ?? 0))
  return (
    <ul className="grid gap-0.5 p-3">
      {BREAKDOWN_ORDER.map((status) => {
        const count = counts[status] ?? 0
        return (
          <li key={status}>
            <a
              href={`#admin/orders?status=${status}`}
              className="group grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:hover:bg-stone-800/50"
            >
              <span className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
                <StatusDot status={status} /> {status === 'paid' ? 'New · Paid' : ORDER_STATUS_LABEL[status]}
              </span>
              <span className="text-sm font-semibold tabular-nums text-stone-900 dark:text-stone-100">{count}</span>
              <span className="col-span-2 block h-1.5 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800" aria-hidden>
                <span className="block h-full rounded-full" style={{ width: `${(count / max) * 100}%`, background: 'var(--admin-chart)' }} />
              </span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}

export function RecentOrders({ orders }: { orders: AdminOrderListItem[] }) {
  return (
    <ul className="divide-y divide-stone-100 dark:divide-stone-800">
      {orders.map((order) => (
        <li key={order.id}>
          <a
            href={`#admin/orders/${order.id}`}
            className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[#faf7f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400 dark:hover:bg-stone-800/40"
          >
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-sm font-semibold text-[#173f32] dark:text-emerald-300">{order.orderNumber}</span>
                <span className="text-xs text-stone-500 dark:text-stone-400">{formatRelative(order.createdAt)}</span>
              </span>
              <span className="block truncate text-xs text-stone-500 dark:text-stone-400">{order.customerName || order.contactEmail} · {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}</span>
            </span>
            <span className="hidden sm:block"><OrderStatusBadge status={order.status} size="sm" /></span>
            <span className="w-20 text-right text-sm font-semibold tabular-nums">{formatMoney(order.total)}</span>
          </a>
          <span className="-mt-2 block px-5 pb-3 sm:hidden"><OrderStatusBadge status={order.status} size="sm" /></span>
        </li>
      ))}
    </ul>
  )
}

export type TopProduct = { productId: string | null; productName: string; unitsSold: number; revenue: number }
export type LowStockItem = { productId: string; productName: string; variantId: string; label: string; sku: string; stock: number }

export function TopProducts({ products }: { products: TopProduct[] }) {
  if (!products.length) return <p className="px-5 py-8 text-center text-sm text-stone-500 dark:text-stone-400">Best sellers show up after the first paid orders.</p>
  return (
    <ol className="divide-y divide-stone-100 dark:divide-stone-800">
      {products.slice(0, 5).map((product, index) => (
        <li key={product.productId ?? product.productName} className="flex items-center gap-3 px-5 py-3">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#f4efe4] text-xs font-bold text-[#aa753a] dark:bg-stone-800 dark:text-amber-400">{index + 1}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-stone-900 dark:text-stone-100">{product.productName}</span>
            <span className="text-xs text-stone-500 dark:text-stone-400">{product.unitsSold} sold</span>
          </span>
          <span className="text-sm font-semibold tabular-nums">{formatMoney(product.revenue)}</span>
        </li>
      ))}
    </ol>
  )
}

export function LowStock({ items }: { items: LowStockItem[] }) {
  if (!items.length) return <p className="px-5 py-8 text-center text-sm text-stone-500 dark:text-stone-400">Every variant is well stocked.</p>
  return (
    <ul className="divide-y divide-stone-100 dark:divide-stone-800">
      {items.slice(0, 6).map((item) => (
        <li key={item.variantId} className="flex items-center gap-3 px-5 py-3">
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-stone-900 dark:text-stone-100">{item.productName} <span className="font-normal text-stone-500">· {item.label}</span></span>
            <span className="font-mono text-[11px] text-stone-400">{item.sku}</span>
          </span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ring-1 ring-inset ${item.stock <= 2 ? 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-900' : 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900'}`}>
            {item.stock} left
          </span>
        </li>
      ))}
    </ul>
  )
}

export function ViewAllLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-[#173f32] hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:text-emerald-300 dark:hover:bg-stone-800">
      {children} <ArrowRight size={13} aria-hidden />
    </a>
  )
}
