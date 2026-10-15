import { AlertCircle, BarChart3, Boxes, CalendarDays, Clock3, IndianRupee, ListOrdered, ReceiptText, ShoppingBag, Trophy, Users } from 'lucide-react'
import {
  KpiSkeleton, KpiTile, LowStock, NeedsAttention, RecentOrders, StatusBreakdown, TopProducts, ViewAllLink, type LowStockItem, type TopProduct,
} from '../../components/admin/DashboardWidgets'
import { SalesChart } from '../../components/admin/SalesChart'
import { OrdersTableSkeleton } from '../../components/admin/OrdersTable'
import { Card, CardHeader, ErrorState, Skeleton } from '../../components/admin/ui'
import { useGetAdminOrdersQuery, useGetDashboardQuery } from '../../features/admin/adminApi'
import { useAuth } from '../../hooks/useAuth'
import { formatMoney } from '../../utils/format'

/** The dashboard payload carries extra lists the shared type leaves open; narrow them here. */
const listOf = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : [])

function greeting() {
  const hour = new Date().getHours()
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
}

const today = () => new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

export function AdminDashboardPage() {
  const { user } = useAuth()
  const { data, error, isLoading, refetch } = useGetDashboardQuery()
  const recent = useGetAdminOrdersQuery({ limit: 8 }, { pollingInterval: 30_000, skipPollingIfUnfocused: true, refetchOnMountOrArgChange: 10 })

  const counts = data?.ordersByStatus ?? {}
  const awaiting = counts.paid ?? 0

  return (
    <div className="grid gap-5 sm:gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[.2em] text-[#aa753a] dark:text-amber-400">
            <CalendarDays size={13} aria-hidden /> {today()}
          </p>
          <h1 className="mt-1 font-display text-4xl font-bold text-[#173f32] sm:text-5xl dark:text-stone-50">
            {greeting()}{user?.firstName ? `, ${user.firstName}` : ''}
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {data ? (awaiting ? `${awaiting} new ${awaiting === 1 ? 'order is' : 'orders are'} waiting for confirmation.` : 'Here’s how the store is doing.') : ' '}
          </p>
        </div>
        <a href="#admin/orders" className="inline-flex items-center gap-2 rounded-full bg-[#173f32] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1e5040] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:bg-emerald-600 dark:hover:bg-emerald-500">
          <ShoppingBag size={16} aria-hidden /> Manage orders
        </a>
      </header>

      {error && !data ? (
        <Card><ErrorState error={error} onRetry={refetch} title="Couldn’t load the dashboard" /></Card>
      ) : (
        <>
          <section aria-label="Key figures" className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
            {isLoading || !data ? (
              Array.from({ length: 5 }, (_, index) => <KpiSkeleton key={index} />)
            ) : (
              <>
                <div className="col-span-2 md:col-span-1">
                  <KpiTile accent label="Revenue · all time" value={formatMoney(data.revenue.allTime)} sub="Paid orders, excl. cancelled" icon={IndianRupee} />
                </div>
                <KpiTile label="Revenue · 30 days" value={formatMoney(data.revenue.last30Days)} sub={`${data.salesLast30Days.reduce((sum, day) => sum + day.orders, 0)} paid orders`} icon={BarChart3} />
                <KpiTile label="Orders" value={data.totals.orders.toLocaleString('en-IN')} sub={awaiting ? `${awaiting} awaiting confirmation` : 'All time'} icon={ListOrdered} />
                <KpiTile label="Average order" value={formatMoney(Math.round(data.revenue.averageOrderValue))} sub="Per paid order" icon={ReceiptText} />
                <KpiTile label="Customers" value={data.totals.customers.toLocaleString('en-IN')} sub={`${data.totals.activeProducts} live products`} icon={Users} />
              </>
            )}
          </section>

          <div className="grid gap-5 sm:gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2" aria-labelledby="sales-heading">
              <CardHeader id="sales-heading" title="Sales" description="Daily revenue from paid orders" icon={BarChart3} />
              {data ? <SalesChart data={data.salesLast30Days} /> : <div className="p-5"><Skeleton className="h-[260px] w-full" /></div>}
            </Card>
            <Card aria-labelledby="attention-heading">
              <CardHeader id="attention-heading" title="Needs attention" description="Orders waiting on the team" icon={AlertCircle} />
              {data ? <NeedsAttention counts={counts} /> : <div className="grid gap-2 p-4">{[0, 1, 2].map((key) => <Skeleton key={key} className="h-14 w-full" />)}</div>}
            </Card>
          </div>

          <div className="grid gap-5 sm:gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2" aria-labelledby="recent-heading">
              <CardHeader id="recent-heading" title="Recent orders" icon={Clock3} action={<ViewAllLink href="#admin/orders">All orders</ViewAllLink>} />
              {recent.isLoading ? (
                <OrdersTableSkeleton rows={5} />
              ) : recent.error && !recent.data ? (
                <ErrorState error={recent.error} onRetry={recent.refetch} title="Couldn’t load recent orders" />
              ) : recent.data?.data.length ? (
                <RecentOrders orders={recent.data.data} />
              ) : (
                <p className="px-5 py-10 text-center text-sm text-stone-500 dark:text-stone-400">No orders yet. They’ll appear here the moment a customer checks out.</p>
              )}
            </Card>
            <Card aria-labelledby="status-heading">
              <CardHeader id="status-heading" title="Orders by status" description="All time" icon={ListOrdered} />
              {data ? <StatusBreakdown counts={counts} /> : <div className="grid gap-3 p-5">{[0, 1, 2, 3, 4].map((key) => <Skeleton key={key} className="h-6 w-full" />)}</div>}
            </Card>
          </div>

          {data && (
            <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
              <Card aria-labelledby="top-heading">
                <CardHeader id="top-heading" title="Best sellers" description="By revenue" icon={Trophy} />
                <TopProducts products={listOf<TopProduct>(data.topProducts)} />
              </Card>
              <Card aria-labelledby="stock-heading">
                <CardHeader id="stock-heading" title="Low stock" description="Variants running out" icon={Boxes} />
                <LowStock items={listOf<LowStockItem>(data.lowStock)} />
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}
