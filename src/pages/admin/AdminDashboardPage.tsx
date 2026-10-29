import {
  AlertCircle,
  ArrowRight,
  Boxes,
  IndianRupee,
  ListOrdered,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { DonutChart } from '../../components/admin/DonutChart'
import { RevenueLineChart } from '../../components/admin/RevenueLineChart'
import { OrdersTableSkeleton } from '../../components/admin/OrdersTable'
import { KpiSkeleton, type LowStockItem, type TopProduct } from '../../components/admin/DashboardWidgets'
import { OrderStatusBadge } from '../../components/admin/StatusBadge'
import { card } from '../../components/admin/styles'
import { ErrorState, Skeleton } from '../../components/admin/ui'
import { useGetAdminOrdersQuery, useGetDashboardQuery } from '../../features/admin/adminApi'
import type { AdminOrderListItem } from '../../types/api'
import { formatMoney } from '../../utils/format'
import '../../styles/admin.css'

const listOf = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : [])

// ── Stat tile ────────────────────────────────────────────────────────────────

function StatTile({
  label, value, sub, icon: Icon, accent, warning,
}: {
  label: string
  value: string | number
  sub?: string
  icon: LucideIcon
  accent?: boolean
  warning?: boolean
}) {
  return (
    <div
      className={`${card} relative flex flex-col gap-2 p-4 sm:p-5 overflow-hidden transition-shadow hover:shadow-md ${
        warning
          ? 'bg-rose-50 ring-rose-200/80 dark:bg-rose-950/30 dark:ring-rose-900/60'
          : accent
          ? '!bg-[#173f32] !ring-[#173f32]'
          : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={`text-xs font-semibold uppercase tracking-wide ${
          warning ? 'text-rose-600 dark:text-rose-400'
          : accent ? 'text-emerald-100/75'
          : 'text-stone-400 dark:text-stone-500'
        }`}>
          {label}
        </p>
        <span className={`grid size-8 place-items-center rounded-xl ${
          warning ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-300'
          : accent ? 'bg-white/15 text-[#D9B27C]'
          : 'bg-[#f4efe4] text-[#aa753a] dark:bg-stone-800 dark:text-amber-400'
        }`}>
          <Icon size={16} aria-hidden />
        </span>
      </div>
      <p className={`text-2xl font-bold leading-none tracking-tight sm:text-3xl ${
        warning ? 'text-rose-700 dark:text-rose-300'
        : accent ? 'text-white'
        : 'text-stone-900 dark:text-stone-50'
      }`}>
        {value}
      </p>
      {sub && (
        <p className={`text-[11px] font-medium ${
          warning ? 'text-rose-500 dark:text-rose-400'
          : accent ? 'text-emerald-100/60'
          : 'text-stone-400 dark:text-stone-500'
        }`}>
          {sub}
        </p>
      )}
    </div>
  )
}

// ── Donut legend ─────────────────────────────────────────────────────────────

/** Every order status falls in exactly one group, so the shares add up to 100%. */
const STATUS_SEGMENTS = [
  { key: 'new',       label: 'New (paid)',      statuses: ['paid'],                                         color: '#fbbf24' },
  { key: 'progress',  label: 'In progress',     statuses: ['processing', 'packed', 'shipped', 'out_for_delivery'], color: '#60a5fa' },
  { key: 'delivered', label: 'Delivered',       statuses: ['delivered'],                                    color: '#1f7a55' },
  { key: 'unpaid',    label: 'Awaiting payment', statuses: ['pending_payment', 'payment_failed'],           color: '#d6d3d1' },
  { key: 'cancelled', label: 'Cancelled',       statuses: ['cancelled'],                                    color: '#f87171' },
] as const

function OrderDonut({ counts: byStatus }: { counts: Partial<Record<string, number>> }) {
  const counts = Object.fromEntries(
    STATUS_SEGMENTS.map((s) => [s.key, s.statuses.reduce((sum: number, status) => sum + (byStatus[status] ?? 0), 0)]),
  ) as Record<(typeof STATUS_SEGMENTS)[number]['key'], number>
  const total: number = Object.values(counts).reduce((s: number, v) => s + v, 0)
  const segments = STATUS_SEGMENTS.map((s) => ({ label: s.label, value: counts[s.key], color: s.color }))

  return (
    <div className="flex flex-col items-center gap-5 p-5">
      <div className="relative">
        <DonutChart segments={segments} size={160} thickness={30} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">{total}</p>
          <p className="text-[11px] text-stone-400 dark:text-stone-500">Total</p>
        </div>
      </div>
      <ul className="w-full space-y-2">
        {STATUS_SEGMENTS.map((s) => {
          const count = counts[s.key]
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <li key={s.key} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                <span className="block size-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                {s.label}
              </span>
              <span className="font-semibold tabular-nums text-stone-800 dark:text-stone-200">{pct}%</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ── Recent orders row ─────────────────────────────────────────────────────────

function RecentOrderRow({ order }: { order: AdminOrderListItem }) {
  return (
    <a
      href={`#admin/orders/${order.id}`}
      className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-4 px-5 py-3 text-sm transition-colors hover:bg-[#faf7f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400 dark:hover:bg-stone-800/40"
    >
      <span className="font-mono text-xs font-semibold text-[#173f32] dark:text-emerald-300 truncate">
        {order.orderNumber}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-medium text-stone-800 dark:text-stone-200">
          {order.customerName || '—'}
        </span>
        <span className="block truncate text-[11px] text-stone-400 dark:text-stone-500">
          {order.contactEmail}
        </span>
      </span>
      <span className="font-semibold tabular-nums text-stone-900 dark:text-stone-100">
        {formatMoney(order.total)}
      </span>
      <OrderStatusBadge status={order.status} size="sm" />
    </a>
  )
}

// ── Top product row ───────────────────────────────────────────────────────────

function TopProductRow({ product, rank }: { product: TopProduct; rank: number }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f4efe4] text-xs font-bold text-[#aa753a] dark:bg-stone-800 dark:text-amber-400">
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-100">{product.productName}</p>
        <p className="text-[11px] text-stone-400 dark:text-stone-500">{product.unitsSold} units sold</p>
      </div>
      <p className="text-right text-sm font-semibold tabular-nums text-stone-900 dark:text-stone-100">
        {formatMoney(product.revenue)}
      </p>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function AdminDashboardPage() {
  const { data, error, isLoading, refetch } = useGetDashboardQuery()
  const recent = useGetAdminOrdersQuery(
    { limit: 5 },
    { pollingInterval: 30_000, skipPollingIfUnfocused: true, refetchOnMountOrArgChange: 10 },
  )

  const counts = data?.ordersByStatus ?? {}
  const awaiting = counts.paid ?? 0
  const lowStockItems = listOf<LowStockItem>(data?.lowStock)
  const topProducts = listOf<TopProduct>(data?.topProducts)

  return (
    <div className="grid gap-5 sm:gap-6">
      {/* Page title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#173f32] dark:text-stone-50 sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {data
              ? awaiting
                ? `${awaiting} new order${awaiting > 1 ? 's' : ''} waiting for confirmation.`
                : "Here's a live overview of your store."
              : 'Loading your store overview…'}
          </p>
        </div>
        <a
          href="#admin/orders"
          className="inline-flex items-center gap-2 rounded-full bg-[#173f32] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1e5040] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          <ListOrdered size={15} aria-hidden /> View all orders
        </a>
      </div>

      {/* Error */}
      {error && !data && (
        <div className={card}>
          <ErrorState error={error} onRetry={refetch} title="Couldn't load the dashboard" />
        </div>
      )}

      {/* ── KPI tiles ──────────────────────────────────────────────────────── */}
      <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
        {isLoading || !data ? (
          Array.from({ length: 6 }, (_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <div className="col-span-2 md:col-span-1">
              <StatTile
                accent
                label="Total Sales"
                value={formatMoney(data.revenue.allTime)}
                sub="All time revenue"
                icon={IndianRupee}
              />
            </div>
            <StatTile
              label="Total Orders"
              value={data.totals.orders.toLocaleString('en-IN')}
              sub={`Avg ${formatMoney(Math.round(data.revenue.averageOrderValue))}`}
              icon={ShoppingCart}
            />
            <StatTile
              label="To confirm"
              value={awaiting}
              sub="Paid, awaiting confirmation"
              icon={AlertCircle}
            />
            <StatTile
              label="Customers"
              value={data.totals.customers.toLocaleString('en-IN')}
              sub="Registered accounts"
              icon={Users}
            />
            <StatTile
              label="Products"
              value={data.totals.activeProducts}
              sub="Active listings"
              icon={Package}
            />
            <StatTile
              warning={lowStockItems.length > 0}
              label="Low Stock"
              value={lowStockItems.length}
              sub={lowStockItems.length > 0 ? 'Critical items' : 'All stocked up'}
              icon={Boxes}
            />
          </>
        )}
      </section>

      {/* ── Charts row ─────────────────────────────────────────────────────── */}
      <div className="grid gap-5 sm:gap-6 xl:grid-cols-3">
        {/* Revenue growth chart */}
        <div className={`${card} xl:col-span-2`} aria-labelledby="revenue-heading">
          <h2 id="revenue-heading" className="sr-only">Revenue Growth</h2>
          {data ? (
            <RevenueLineChart data={data.salesLast30Days} />
          ) : (
            <div className="p-5">
              <Skeleton className="h-[260px] w-full" />
            </div>
          )}
        </div>

        {/* Order summary donut */}
        <div className={card} aria-labelledby="order-summary-heading">
          <header className="flex items-center justify-between border-b border-stone-100 px-5 py-4 dark:border-stone-800">
            <div>
              <h2 id="order-summary-heading" className="text-base font-semibold text-stone-800 dark:text-stone-100">
                Order Summary
              </h2>
            </div>
            <TrendingUp size={16} className="text-[#aa753a] dark:text-amber-400" aria-hidden />
          </header>
          {data ? (
            <OrderDonut counts={counts} />
          ) : (
            <div className="flex flex-col items-center gap-4 p-5">
              <Skeleton className="size-40 rounded-full" />
              {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent orders + Top products ───────────────────────────────────── */}
      <div className="grid gap-5 sm:gap-6 xl:grid-cols-2">
        {/* Recent orders */}
        <div className={card} aria-labelledby="recent-orders-heading">
          <header className="flex items-center justify-between border-b border-stone-100 px-5 py-4 dark:border-stone-800">
            <h2 id="recent-orders-heading" className="text-base font-semibold text-stone-800 dark:text-stone-100">
              Recent Orders
            </h2>
            <a
              href="#admin/orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#173f32] hover:underline dark:text-emerald-300"
            >
              View All <ArrowRight size={12} aria-hidden />
            </a>
          </header>

          {/* Column headings */}
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-x-4 border-b border-stone-100 px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-stone-400 dark:border-stone-800 dark:text-stone-500">
            <span>Order ID</span>
            <span>Customer</span>
            <span>Amount</span>
            <span>Status</span>
          </div>

          {recent.isLoading ? (
            <OrdersTableSkeleton rows={5} />
          ) : recent.error && !recent.data ? (
            <ErrorState error={recent.error} onRetry={recent.refetch} title="Couldn't load orders" />
          ) : recent.data?.data.length ? (
            <ul className="divide-y divide-stone-100 dark:divide-stone-800">
              {recent.data.data.map(order => (
                <li key={order.id}>
                  <RecentOrderRow order={order} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-stone-400 dark:text-stone-500">
              No orders yet — they'll appear the moment a customer checks out.
            </p>
          )}
        </div>

        {/* Top selling products */}
        <div className={card} aria-labelledby="top-products-heading">
          <header className="flex items-center justify-between border-b border-stone-100 px-5 py-4 dark:border-stone-800">
            <h2 id="top-products-heading" className="text-base font-semibold text-stone-800 dark:text-stone-100">
              Top Selling Products
            </h2>
            <a
              href="#shop"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#173f32] hover:underline dark:text-emerald-300"
            >
              View Inventory <ArrowRight size={12} aria-hidden />
            </a>
          </header>

          {!data ? (
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-36" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : topProducts.length ? (
            <ol className="divide-y divide-stone-100 dark:divide-stone-800">
              {topProducts.slice(0, 5).map((product, i) => (
                <li key={product.productId ?? product.productName}>
                  <TopProductRow product={product} rank={i + 1} />
                </li>
              ))}
            </ol>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-stone-400 dark:text-stone-500">
              Top sellers appear after the first paid orders come in.
            </p>
          )}
        </div>
      </div>

      {/* ── Low stock warning strip (if any) ──────────────────────────────── */}
      {data && lowStockItems.length > 0 && (
        <div className={`${card} border border-rose-200/60 dark:border-rose-900/60`} aria-labelledby="low-stock-heading">
          <header className="flex items-center justify-between border-b border-rose-100/80 px-5 py-4 dark:border-rose-900/40">
            <div className="flex items-center gap-2">
              <Boxes size={15} className="text-rose-500 dark:text-rose-400" aria-hidden />
              <h2 id="low-stock-heading" className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                Low Stock Alert — {lowStockItems.length} variant{lowStockItems.length > 1 ? 's' : ''} running out
              </h2>
            </div>
          </header>
          <ul className="divide-y divide-stone-100 dark:divide-stone-800">
            {lowStockItems.slice(0, 6).map(item => (
              <li key={item.variantId} className="flex items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-100">
                    {item.productName}{' '}
                    <span className="font-normal text-stone-400">· {item.label}</span>
                  </p>
                  <p className="font-mono text-[11px] text-stone-400">{item.sku}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums ring-1 ring-inset ${
                    item.stock <= 2
                      ? 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-900'
                      : 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900'
                  }`}
                >
                  {item.stock} left
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
