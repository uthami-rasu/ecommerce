import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Loader2,
  Search,
  Slash,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { navigate } from '../../utils/router'
import { toast } from 'sonner'
import type { LucideIcon } from 'lucide-react'
import { useGetAdminCustomerStatsQuery, useGetAdminCustomersQuery, useUpdateCustomerStatusMutation } from '../../features/admin/adminApi'

const CUSTOMERS_LIMIT = 10

export function AdminCustomersPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  // Debounce search and reset to first page on change.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data: customersRes, isLoading, refetch } = useGetAdminCustomersQuery({
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    limit: CUSTOMERS_LIMIT,
  })

  const [updateStatus] = useUpdateCustomerStatusMutation()
  const { data: stats } = useGetAdminCustomerStatsQuery()

  const customers = customersRes?.data ?? []
  const total = customersRes?.meta.total ?? 0
  const limit = customersRes?.meta.limit ?? CUSTOMERS_LIMIT
  const totalPages = Math.max(1, customersRes?.meta.totalPages ?? 1)

  // Clamp page when filters shrink totalPages.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pageNumbers = useMemo<(number | '...')[]>(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const windowed: (number | '...')[] = [1]
    if (page > 3) windowed.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) windowed.push(i)
    if (page < totalPages - 2) windowed.push('...')
    windowed.push(totalPages)
    return windowed
  }, [page, totalPages])

  const exportCustomers = () => {
    if (!customers.length) {
      toast.info('No customers to export')
      return
    }
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Name,Email,Phone,Orders,Spent,Joined,Status']
        .concat(
          customers.map(
            (c) => `"${c.name}","${c.email}","${c.phone}",${c.orders},${c.spent},"${c.joined}",${c.status}`
          )
        )
        .join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'customers.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Customers exported to CSV')
  }

  const handleToggleStatus = async (id: string, currentStatus: string, name: string) => {
    const nextActive = currentStatus !== 'Active'
    try {
      await updateStatus({ id, isActive: nextActive }).unwrap()
      toast.success(nextActive ? `Account enabled for ${name}` : `Account disabled for ${name}`)
      refetch()
    } catch {
      toast.error('Failed to update customer status')
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl">Customers</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Accounts created on the storefront. Customers sign up themselves at checkout.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total customers" value={stats?.total} note={stats ? `${stats.withOrders} placed an order` : undefined} />
        <StatCard icon={UserPlus} label="New this month" value={stats?.newThisMonth} note={new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })} />
        <StatCard icon={UserCheck} label="Active accounts" value={stats?.active} note={stats?.total ? `${Math.round((stats.active / stats.total) * 100)}% of all` : undefined} />
        <StatCard icon={UserMinus} label="Disabled accounts" value={stats?.inactive} note="Can’t sign in" />
      </div>

      {/* Filter and Search Bar matching Mockup 3 */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              placeholder="Name, phone or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-3 text-xs text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative min-w-[130px]">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="w-full appearance-none rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 px-3 text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
            />
          </div>
        </div>

        {/* Export Button */}
        <button
          type="button"
          onClick={exportCustomers}
          className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 shadow-sm hover:bg-stone-50 transition-colors"
        >
          <Download size={14} /> Export
        </button>
      </div>

      {/* Customers Table matching Mockup 3 */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/50 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Contact Info</th>
                <th className="px-4 py-3.5 text-center">Orders</th>
                <th className="px-4 py-3.5 text-right">Total Spent</th>
                <th className="px-5 py-3.5">Last Order</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin text-[#1f7a55]" />
                      <span>Loading customers from database...</span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-500">
                    <p className="font-semibold">No customers found</p>
                    <p className="text-xs text-stone-400 mt-1">Try adjusting your search or status filter</p>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => navigate(`admin/customers/${customer.id}`)}
                    className="hover:bg-stone-50/60 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {customer.avatar ? (
                          <img
                            src={customer.avatar}
                            alt={customer.name}
                            className="size-10 rounded-full object-cover ring-1 ring-stone-200"
                          />
                        ) : (
                          <div className="grid size-10 place-items-center rounded-full bg-[#173f32] text-xs font-bold text-amber-200">
                            {customer.name ? customer.name.slice(0, 2).toUpperCase() : 'CU'}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-stone-900 group-hover:text-[#1f7a55]">
                            {customer.name}
                          </p>
                          <p className="text-[11px] text-stone-400">Joined {customer.joined}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-stone-900">{customer.phone}</p>
                      <p className="text-[11px] text-stone-400">{customer.email}</p>
                    </td>

                    <td className="px-4 py-4 text-center font-bold text-stone-900">
                      {customer.orders}
                    </td>

                    <td className="px-4 py-4 text-right font-bold text-stone-900">
                      ₹{customer.spent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="px-5 py-4 text-stone-600 whitespace-nowrap">
                      {customer.lastOrder}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {customer.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-bold text-stone-500 ring-1 ring-stone-200">
                          <span className="size-1.5 rounded-full bg-stone-400" />
                          Inactive
                        </span>
                      )}
                    </td>

                    <td
                      className="px-6 py-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-2 text-stone-400">
                        <button
                          type="button"
                          onClick={() => navigate(`admin/customers/${customer.id}`)}
                          className="hover:text-stone-700 p-1"
                          title="View Customer Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(customer.id, customer.status, customer.name)}
                          className={`p-1 transition-colors ${customer.status === 'Active' ? 'hover:text-rose-600' : 'hover:text-emerald-600'}`}
                          title={customer.status === 'Active' ? 'Disable Account' : 'Enable Account'}
                        >
                          {customer.status === 'Active' ? <Slash size={14} /> : <UserCheck size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-100 bg-white px-6 py-4 text-xs text-stone-500">
          <p>
            Showing <strong className="text-stone-800">{total === 0 ? 0 : (page - 1) * limit + 1}</strong> to{' '}
            <strong className="text-stone-800">{Math.min(page * limit, total)}</strong> of{' '}
            <strong className="text-stone-800">{total}</strong> customers
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1.5 font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-40"
            >
              <ChevronLeft size={13} />
            </button>

            {pageNumbers.map((num, i) =>
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
            )}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1.5 font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-40"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}

function StatCard({ icon: Icon, label, value, note }: { icon: LucideIcon; label: string; value?: number; note?: string }) {
  return (
    <div className="space-y-3 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300"><Icon size={18} aria-hidden /></span>
        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">{label}</span>
      </div>
      {value === undefined ? (
        <span className="admin-skeleton block h-8 w-16" aria-hidden />
      ) : (
        <p className="font-display text-2xl font-bold text-stone-900 dark:text-stone-50">{value.toLocaleString('en-IN')}</p>
      )}
      {note && <p className="text-[11px] text-stone-400">{note}</p>}
    </div>
  )
}
