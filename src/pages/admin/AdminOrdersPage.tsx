import {
  Bell,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  FileText,
  Filter,
  Search,
  ShoppingBag,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Dialog } from '../../components/admin/Dialog'
import {
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
} from '../../features/admin/adminApi'
import { useRoute } from '../../hooks/useRoute'
import type { AdminOrderListItem, OrderStatus } from '../../types/api'
import { formatDate, formatMoney } from '../../utils/format'
import { navigate } from '../../utils/router'
import { toast } from 'sonner'
import { useAuth } from '../../hooks/useAuth'

const ORDERS_LIMIT = 10

const STATUS_TABS = [
  { id: 'all', label: 'All', queryVal: '' },
  { id: 'new', label: 'New', queryVal: 'paid' },
  { id: 'confirmed', label: 'Confirmed', queryVal: 'processing' },
  { id: 'processing', label: 'Processing', queryVal: 'processing' },
  { id: 'packed', label: 'Packed', queryVal: 'packed' },
  { id: 'shipped', label: 'Shipped', queryVal: 'shipped' },
  { id: 'out_for_delivery', label: 'Out for Delivery', queryVal: 'out_for_delivery' },
  { id: 'delivered', label: 'Delivered', queryVal: 'delivered' },
  { id: 'cancelled', label: 'Cancelled', queryVal: 'cancelled' },
  { id: 'returned', label: 'Returned', queryVal: 'cancelled' },
]

export function AdminOrdersPage() {
  const { user } = useAuth()
  const { query } = useRoute()
  const rawStatus = query.get('status') ?? ''
  const searchParam = query.get('search') ?? ''
  const pageParam = Math.max(1, Number(query.get('page')) || 1)

  // Filter Form State
  const [orderIdFilter, setOrderIdFilter] = useState(searchParam)
  const [customerFilter, setCustomerFilter] = useState('')
  const [dateRangeFilter, setDateRangeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState(rawStatus || 'all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [deliveryFilter, setDeliveryFilter] = useState('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all')

  const [activeTab, setActiveTab] = useState(rawStatus || 'all')
  const [page, setPage] = useState(pageParam)
  const [debouncedSearch, setDebouncedSearch] = useState(searchParam)
  const firstSearch = useRef(true)

  // Debounce text search and reset to first page (skip initial mount to keep ?page= deep links).
  useEffect(() => {
    if (firstSearch.current) {
      firstSearch.current = false
      return
    }
    const t = setTimeout(() => {
      setDebouncedSearch(orderIdFilter || customerFilter || '')
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [orderIdFilter, customerFilter])

  // Modal for editing status from table actions
  const [editOrder, setEditOrder] = useState<AdminOrderListItem | null>(null)

  const { data, refetch } = useGetAdminOrdersQuery(
    {
      page,
      limit: ORDERS_LIMIT,
      status: activeTab === 'all' ? undefined : (activeTab as OrderStatus),
      search: debouncedSearch || undefined,
    },
    { pollingInterval: 30_000, skipPollingIfUnfocused: true, refetchOnMountOrArgChange: 10 }
  )

  const orders: AdminOrderListItem[] = data?.data ?? []
  const total = data?.meta.total ?? 0
  const limit = data?.meta.limit ?? ORDERS_LIMIT
  const totalPages = Math.max(1, data?.meta.totalPages ?? 1)

  // Clamp page when filters shrink totalPages.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const applyFilters = () => {
    setActiveTab(statusFilter)
    setPage(1)
    refetch()
    toast.success('Filters applied')
  }

  const resetFilters = () => {
    setOrderIdFilter('')
    setCustomerFilter('')
    setDateRangeFilter('')
    setStatusFilter('all')
    setPaymentFilter('all')
    setDeliveryFilter('all')
    setPaymentMethodFilter('all')
    setActiveTab('all')
    setPage(1)
    refetch()
  }

  const handleTabClick = (tabVal: string) => {
    setActiveTab(tabVal)
    setStatusFilter(tabVal)
    setPage(1)
  }

  // Payment badge helper
  const getPaymentBadge = (status: string | null) => {
    const isPaid = status === 'succeeded' || status === 'paid'
    const isPending = status === 'pending' || status === 'created'
    if (isPaid) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          PAID
        </span>
      )
    }
    if (isPending) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200">
          <span className="size-1.5 rounded-full bg-amber-500" />
          PENDING
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 ring-1 ring-rose-200">
        <span className="size-1.5 rounded-full bg-rose-500" />
        FAILED
      </span>
    )
  }

  // Order status badge helper
  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 ring-1 ring-blue-200">
            <span className="size-1.5 rounded-full bg-blue-500" />
            NEW
          </span>
        )
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 ring-1 ring-slate-300">
            <span className="size-1.5 rounded-full bg-slate-500" />
            CONFIRMED
          </span>
        )
      case 'packed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 ring-1 ring-indigo-200">
            <span className="size-1.5 rounded-full bg-indigo-500" />
            PACKED
          </span>
        )
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 ring-1 ring-purple-200">
            <span className="size-1.5 rounded-full bg-purple-500" />
            SHIPPED
          </span>
        )
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200">
            <span className="size-1.5 rounded-full bg-amber-500" />
            OUT FOR DELIVERY
          </span>
        )
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            DELIVERED
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 ring-1 ring-rose-200">
            <span className="size-1.5 rounded-full bg-rose-500" />
            CANCELLED
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-bold text-stone-700 ring-1 ring-stone-200">
            {status}
          </span>
        )
    }
  }

  // Delivery status badge helper
  const getDeliveryBadge = (order: AdminOrderListItem) => {
    if (order.status === 'delivered') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          DELIVERED
        </span>
      )
    }
    if (order.status === 'shipped' || order.status === 'out_for_delivery') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-orange-700 ring-1 ring-orange-200">
          <span className="size-1.5 rounded-full bg-orange-500" />
          IN TRANSIT
        </span>
      )
    }
    if (order.status === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-bold text-stone-500 ring-1 ring-stone-200">
          <span className="size-1.5 rounded-full bg-stone-400" />
          N/A
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200">
        <span className="size-1.5 rounded-full bg-amber-500" />
        PENDING
      </span>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header matching Mockup 1 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Orders
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Manage and process customer orders efficiently
          </p>
        </div>

        {/* Top right admin info */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="relative grid size-9 place-items-center rounded-full bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 shadow-sm"
            aria-label="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[#1f7a55]" />
          </button>
          <div className="flex items-center gap-2.5">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName || user.firstName}
                className="size-9 rounded-full object-cover ring-2 ring-emerald-500/20"
              />
            ) : (
              <div className="grid size-9 place-items-center rounded-full bg-[#173f32] text-xs font-bold text-amber-200">
                {user ? (user.displayName || `${user.firstName} ${user.lastName}`).slice(0, 2).toUpperCase() : 'AD'}
              </div>
            )}
            <div className="text-left">
              <p className="text-xs font-bold text-stone-900 leading-tight">
                {user ? (user.displayName || `${user.firstName} ${user.lastName}`) : 'Administrator'}
              </p>
              <p className="text-[11px] text-stone-500 leading-tight">Store Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Card matching Mockup 1 */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm space-y-4">
        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Search Order ID
            </label>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="text"
                placeholder="#ORD-..."
                value={orderIdFilter}
                onChange={(e) => setOrderIdFilter(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pl-9 pr-3 text-xs text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Customer
            </label>
            <input
              type="text"
              placeholder="Name or Email"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 px-3.5 text-xs text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Date Range
            </label>
            <div className="relative">
              <Calendar
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="text"
                placeholder="Filter by date range..."
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pl-9 pr-3 text-xs text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Order Status
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 px-3.5 text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
              >
                <option value="all">All Status</option>
                <option value="paid">New / Paid</option>
                <option value="processing">Confirmed</option>
                <option value="packed">Packed</option>
                <option value="shipped">Shipped</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400"
              />
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Payment Status
            </label>
            <div className="relative">
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 px-3.5 text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
              >
                <option value="all">Any</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Delivery Status
            </label>
            <div className="relative">
              <select
                value={deliveryFilter}
                onChange={(e) => setDeliveryFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 px-3.5 text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
              >
                <option value="all">Any</option>
                <option value="pending">Pending</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Payment Method
            </label>
            <div className="relative">
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 px-3.5 text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
              >
                <option value="all">Any</option>
                <option value="card">Credit / Debit Card</option>
                <option value="upi">UPI</option>
                <option value="net_banking">Net Banking</option>
                <option value="cod">COD</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400"
              />
            </div>
          </div>

          {/* Apply Filters & Reset Buttons */}
          <div className="flex items-center gap-3 lg:col-span-2 justify-end pt-1">
            <button
              type="button"
              onClick={applyFilters}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1f7a55] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-[#186847] transition-colors"
            >
              <Filter size={14} /> Apply Filters
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors px-2"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Quick Status Tabs matching Mockup 1 */}
      <div className="border-b border-stone-200">
        <nav className="flex space-x-6 overflow-x-auto pb-px">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.id || (tab.id === 'all' && activeTab === '')
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`whitespace-nowrap pb-3 text-xs font-bold transition-colors ${
                  isActive
                    ? 'border-b-2 border-[#1f7a55] text-[#1f7a55]'
                    : 'border-b-2 border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Orders Table matching Mockup 1 */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/50 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                <th className="px-5 py-3.5">Order ID</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Items</th>
                <th className="px-4 py-3.5">Order Date</th>
                <th className="px-4 py-3.5 font-bold">Amount</th>
                <th className="px-4 py-3.5">Payment</th>
                <th className="px-4 py-3.5">Order Status</th>
                <th className="px-4 py-3.5">Delivery</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-stone-400">
                    No orders match the current criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-stone-50/60 transition-colors cursor-pointer group"
                    onClick={() => navigate(`admin/orders/${order.id}`)}
                  >
                    <td className="px-5 py-4 font-bold text-stone-900 group-hover:text-[#1f7a55]">
                      {order.orderNumber}
                    </td>

                    <td className="px-4 py-4">
                      <div>
                        <p className="font-bold text-stone-900">{order.customerName || order.contactEmail || 'Guest Customer'}</p>
                        <p className="text-[11px] text-stone-400">{order.contactEmail || '—'}</p>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="grid size-7 place-items-center rounded-lg bg-stone-100 text-stone-600 font-bold text-xs ring-1 ring-stone-200">
                          <ShoppingBag size={13} />
                        </span>
                        <span className="font-semibold text-stone-700">
                          {order.itemCount} {order.itemCount === 1 ? 'Item' : 'Items'}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-stone-500 whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="px-4 py-4 font-bold text-stone-900 whitespace-nowrap">
                      {formatMoney(order.total)}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {getPaymentBadge(order.paymentStatus)}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {getOrderStatusBadge(order.status)}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {getDeliveryBadge(order)}
                    </td>

                    <td
                      className="px-5 py-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-2 text-stone-400">
                        <button
                          type="button"
                          onClick={() => navigate(`admin/orders/${order.id}`)}
                          className="hover:text-stone-700 p-1"
                          title="View Order Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditOrder(order)}
                          className="hover:text-[#1f7a55] p-1"
                          title="Edit Tracking & Status"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="hover:text-stone-700 p-1"
                          title="Print Invoice"
                        >
                          <FileText size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar matching Mockup 1 */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-100 bg-white px-6 py-4 text-xs text-stone-500">
          <p>
            Showing <strong className="text-stone-800">{total === 0 ? 0 : (page - 1) * limit + 1}</strong> to{' '}
            <strong className="text-stone-800">{Math.min(page * limit, total)}</strong> of{' '}
            <strong className="text-stone-800">{total}</strong> orders
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1.5 font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-40"
            >
              <ChevronLeft size={13} /> Previous
            </button>

            {(() => {
              const items: (number | '...')[] = []
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) items.push(i)
              } else {
                items.push(1)
                if (page > 3) items.push('...')
                for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) items.push(i)
                if (page < totalPages - 2) items.push('...')
                items.push(totalPages)
              }
              return items.map((num, i) =>
                num === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-stone-400">...</span>
                ) : (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPage(num)}
                    className={`size-7 rounded-lg font-bold text-xs ${
                      page === num
                        ? 'bg-[#1f7a55] text-white shadow-sm'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {num}
                  </button>
                ),
              )
            })()}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1.5 font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-40"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Real-time status footer matching Mockup 1 */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-stone-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            Server Status: Healthy
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            Sync Status: Real-time
          </span>
        </div>
        <p>Live database sync active</p>
      </div>

      {/* Quick Edit Status Modal */}
      {editOrder && (
        <QuickEditStatusModal
          order={editOrder}
          onClose={() => {
            setEditOrder(null)
            refetch()
          }}
        />
      )}
    </div>
  )
}

function QuickEditStatusModal({
  order,
  onClose,
}: {
  order: AdminOrderListItem
  onClose: () => void
}) {
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [carrier, setCarrier] = useState(order.tracking?.carrier || '')
  const [trackingNumber, setTrackingNumber] = useState(
    order.tracking?.trackingNumber || ''
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [updateStatus] = useUpdateOrderStatusMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await updateStatus({
        id: order.id,
        status,
        carrier: carrier.trim() || undefined,
        trackingNumber: trackingNumber.trim() || undefined,
      }).unwrap()
      toast.success(`Order ${order.orderNumber} updated`)
      onClose()
    } catch (err) {
      toast.error('Failed to update status')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog title={`Update ${order.orderNumber}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        <div>
          <label className="block text-xs font-bold text-stone-600 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
          >
            <option value="paid">New / Paid</option>
            <option value="processing">Confirmed</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-600 mb-1">Carrier</label>
          <input
            type="text"
            placeholder="e.g. BlueDart / Delhivery / SpeedPost"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-600 mb-1">Tracking Number</label>
          <input
            type="text"
            placeholder="e.g. BD-10928391"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-[#1f7a55] px-4 py-2 text-xs font-bold text-white hover:bg-[#186847]"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
