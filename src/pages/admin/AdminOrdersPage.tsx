import { ChevronLeft, ChevronRight, Inbox, RotateCw, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { OrdersTable, OrdersTableSkeleton } from '../../components/admin/OrdersTable'
import { TransitionDialog, type TransitionOrder } from '../../components/admin/TransitionDialog'
import { dayBoundIso } from '../../components/admin/dates'
import { btn, card, input } from '../../components/admin/styles'
import { EmptyState, ErrorState } from '../../components/admin/ui'
import { useGetAdminOrdersQuery, useGetDashboardQuery } from '../../features/admin/adminApi'
import { useRoute } from '../../hooks/useRoute'
import type { AdminOrderListItem, OrderStatus } from '../../types/api'
import { navigate } from '../../utils/router'

const PAGE_SIZE = 20

const TABS: Array<{ value: OrderStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending_payment', label: 'Awaiting payment' },
  { value: 'paid', label: 'New · Paid' },
  { value: 'processing', label: 'Confirmed' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'payment_failed', label: 'Payment failed' },
]

const STATUSES = new Set<string>(TABS.map((tab) => tab.value).filter((value) => value !== 'all'))

type Filters = { status?: string; search?: string; from?: string; to?: string; page?: string }

export function AdminOrdersPage() {
  const { query } = useRoute()
  const rawStatus = query.get('status') ?? ''
  const status = STATUSES.has(rawStatus) ? (rawStatus as OrderStatus) : undefined
  const search = query.get('search') ?? ''
  const from = query.get('from') ?? ''
  const to = query.get('to') ?? ''
  const page = Math.max(1, Number(query.get('page')) || 1)

  const current: Filters = { status, search: search || undefined, from: from || undefined, to: to || undefined, page: page > 1 ? String(page) : undefined }
  const setFilters = (patch: Filters) => navigate('admin/orders', { replace: true, query: { ...current, page: undefined, ...patch } })

  // Search box: local text, pushed to the URL after a short pause.
  const [text, setText] = useState(search)
  const [syncedSearch, setSyncedSearch] = useState(search)
  if (search !== syncedSearch) {
    setSyncedSearch(search)
    setText(search)
  }
  useEffect(() => {
    if (text.trim() === search) return
    const timer = setTimeout(() => {
      navigate('admin/orders', { replace: true, query: { status, from: from || undefined, to: to || undefined, search: text.trim() || undefined } })
    }, 350)
    return () => clearTimeout(timer)
  }, [text, search, status, from, to])

  const { data: dashboard } = useGetDashboardQuery()
  const counts = dashboard?.ordersByStatus
  const { data, error, isLoading, isFetching, refetch } = useGetAdminOrdersQuery(
    { page, limit: PAGE_SIZE, status, search: search || undefined, from: dayBoundIso(from, 'start'), to: dayBoundIso(to, 'end') },
    { pollingInterval: 30_000, skipPollingIfUnfocused: true, refetchOnMountOrArgChange: 10 },
  )

  const [action, setAction] = useState<{ order: TransitionOrder; target: OrderStatus } | null>(null)
  const openAction = (order: AdminOrderListItem, target: OrderStatus) => setAction({ order: { ...order, tracking: order.tracking ?? null }, target })

  const filtered = Boolean(status || search || from || to)
  const total = data?.meta.total ?? 0
  const totalPages = data?.meta.totalPages ?? 0
  const firstRow = total ? (page - 1) * PAGE_SIZE + 1 : 0
  const lastRow = Math.min(total, page * PAGE_SIZE)

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#aa753a] dark:text-amber-400">Fulfilment</p>
          <h1 className="mt-1 font-display text-4xl font-bold text-[#173f32] sm:text-5xl dark:text-stone-50">Orders</h1>
        </div>
        <button type="button" className={btn.secondary} onClick={() => refetch()} disabled={isFetching}>
          <RotateCw size={15} aria-hidden className={isFetching ? 'animate-spin' : ''} /> Refresh
        </button>
      </header>

      <nav aria-label="Order status" className="admin-scroll-x -mx-4 mt-6 px-4 sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-1.5 pb-1 xl:w-auto xl:flex-wrap">
          {TABS.map((tab) => {
            const selected = (tab.value === 'all' && !status) || tab.value === status
            const count = tab.value === 'all' ? dashboard?.totals.orders : counts?.[tab.value]
            return (
              <li key={tab.value}>
                <a
                  href={`#admin/orders${tab.value === 'all' ? '' : `?status=${tab.value}`}`}
                  aria-current={selected ? 'page' : undefined}
                  onClick={(event) => {
                    event.preventDefault()
                    setFilters({ status: tab.value === 'all' ? undefined : tab.value })
                  }}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    selected
                      ? 'bg-[#173f32] text-white shadow-sm dark:bg-emerald-700'
                      : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 hover:text-stone-900 dark:bg-stone-900 dark:text-stone-300 dark:ring-stone-800 dark:hover:bg-stone-800'
                  }`}
                >
                  {tab.label}
                  {count !== undefined && (
                    <span
                      className={`rounded-full px-1.5 text-[11px] font-semibold tabular-nums ${
                        selected
                          ? 'bg-white/20 text-white'
                          : tab.value === 'paid' && count > 0
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-100'
                            : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className={`${card} mt-4 overflow-hidden`}>
        <div className="flex flex-col gap-3 border-b border-stone-100 p-4 sm:flex-row sm:items-end sm:p-5 dark:border-stone-800">
          <div className="relative flex-1">
            <label htmlFor="order-search" className="sr-only">Search orders</label>
            <Search size={16} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              id="order-search"
              type="search"
              className={`${input} !pl-10`}
              placeholder="Search order number or email"
              value={text}
              onChange={(event) => setText(event.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-end">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">From<span className="sr-only"> date</span></span>
              <input type="date" className={`${input} sm:w-40`} value={from} max={to || undefined} onChange={(event) => setFilters({ from: event.target.value || undefined })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">To<span className="sr-only"> date</span></span>
              <input type="date" className={`${input} sm:w-40`} value={to} min={from || undefined} onChange={(event) => setFilters({ to: event.target.value || undefined })} />
            </label>
          </div>
          {filtered && (
            <button type="button" className={`${btn.ghost} self-start sm:self-end`} onClick={() => { setText(''); navigate('admin/orders', { replace: true }) }}>
              <X size={15} aria-hidden /> Clear
            </button>
          )}
        </div>

        <p className="sr-only" aria-live="polite">{data ? `${total} orders found` : ''}</p>

        {isLoading ? (
          <OrdersTableSkeleton />
        ) : error && !data ? (
          <ErrorState error={error} onRetry={refetch} title="Couldn’t load orders" />
        ) : !data?.data.length ? (
          <EmptyState
            icon={Inbox}
            title={filtered ? 'No matching orders' : 'No orders yet'}
            action={filtered ? <button type="button" className={btn.secondary} onClick={() => { setText(''); navigate('admin/orders', { replace: true }) }}>Clear filters</button> : undefined}
          >
            {filtered ? 'Try another status, a different search or a wider date range.' : 'New orders appear here as soon as customers check out.'}
          </EmptyState>
        ) : (
          <OrdersTable orders={data.data} onAction={openAction} fetching={isFetching} />
        )}

        {data && total > 0 && (
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 px-4 py-3 text-sm sm:px-5 dark:border-stone-800">
            <p className="text-stone-500 tabular-nums dark:text-stone-400">
              Showing <span className="font-semibold text-stone-800 dark:text-stone-200">{firstRow}–{lastRow}</span> of <span className="font-semibold text-stone-800 dark:text-stone-200">{total}</span>
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button type="button" className={btn.small} disabled={page <= 1} onClick={() => setFilters({ page: page - 1 > 1 ? String(page - 1) : undefined })}>
                  <ChevronLeft size={14} aria-hidden /> Previous
                </button>
                <span className="text-xs text-stone-500 tabular-nums dark:text-stone-400">Page {page} of {totalPages}</span>
                <button type="button" className={btn.small} disabled={page >= totalPages} onClick={() => setFilters({ page: String(page + 1) })}>
                  Next <ChevronRight size={14} aria-hidden />
                </button>
              </div>
            )}
          </footer>
        )}
      </div>

      {action && <TransitionDialog order={action.order} target={action.target} onClose={() => setAction(null)} />}
    </div>
  )
}
