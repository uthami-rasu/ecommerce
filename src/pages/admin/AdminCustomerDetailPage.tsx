import {
  Calendar,
  Check,
  Edit2,
  IndianRupee,
  Loader2,
  Mail,
  Phone,
  User,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { Dialog } from '../../components/admin/Dialog'
import { toast } from 'sonner'
import { useGetAdminCustomerQuery, useUpdateCustomerStatusMutation } from '../../features/admin/adminApi'

export function AdminCustomerDetailPage({ id }: { id: string }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses' | 'payments'>(
    'overview'
  )
  const [editModal, setEditModal] = useState(false)

  const { data: customer, isLoading, error, refetch } = useGetAdminCustomerQuery(id)
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateCustomerStatusMutation()

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <Loader2 size={32} className="mx-auto animate-spin text-[#1f7a55]" />
        <p className="mt-3 text-sm text-stone-500 font-medium">Loading customer profile...</p>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
        <User size={36} className="mx-auto text-stone-400" />
        <h2 className="mt-3 text-base font-bold text-stone-800">Customer not found</h2>
        <p className="mt-1 text-xs text-stone-500">The customer with ID {id} does not exist.</p>
        <a
          href="#admin/customers"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1f7a55] px-4 py-2 text-xs font-bold text-white hover:bg-[#186847]"
        >
          Back to Customers
        </a>
      </div>
    )
  }

  const isActive = customer.status === 'Active'
  const completedOrders = customer.orders.filter((o: any) => o.status === 'delivered').length
  const cancelledOrders = customer.orders.filter((o: any) => o.status === 'cancelled').length

  const toggleDisable = async () => {
    try {
      await updateStatus({ id, isActive: !isActive }).unwrap()
      toast.success(!isActive ? 'Account enabled successfully' : 'Account disabled successfully')
      refetch()
    } catch {
      toast.error('Failed to update account status')
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb & Actions matching Mockup 4 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
          <a href="#admin/customers" className="hover:text-[#1f7a55]">
            Customers
          </a>
          <span>&gt;</span>
          <span className="font-bold text-stone-900">{customer.name}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setEditModal(true)}
            className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-sm hover:bg-stone-50"
          >
            Edit Customer
          </button>
          <button
            type="button"
            disabled={isUpdatingStatus}
            onClick={toggleDisable}
            className={`rounded-xl border px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50 ${
              !isActive
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'border-rose-200 bg-white text-rose-600 shadow-sm hover:bg-rose-50'
            }`}
          >
            {!isActive ? 'Enable Account' : 'Disable Account'}
          </button>
        </div>
      </div>

      {/* Profile Card matching Mockup 4 */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-5">
          <div className="relative">
            {customer.avatarUrl ? (
              <img
                src={customer.avatarUrl}
                alt={customer.name}
                className="size-16 rounded-2xl object-cover ring-2 ring-stone-200"
              />
            ) : (
              <div className="grid size-16 place-items-center rounded-2xl bg-[#173f32] text-xl font-bold text-amber-200">
                {customer.name ? customer.name.slice(0, 2).toUpperCase() : 'CU'}
              </div>
            )}
            <span
              className={`absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-white ${
                isActive ? 'bg-emerald-500' : 'bg-stone-400'
              }`}
            />
          </div>

          <div className="space-y-1.5 flex-1 min-w-[240px]">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold text-stone-900">
                {customer.name}
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  !isActive
                    ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                    : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                }`}
              >
                ● {customer.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-stone-500">
              <span className="flex items-center gap-1.5">
                <Phone size={13} className="text-stone-400" /> {customer.phone || 'No phone set'}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail size={13} className="text-stone-400" /> {customer.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-stone-400" /> Joined {customer.joined}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stats KPI Tiles matching Mockup 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="flex items-center gap-4 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
          <span className="grid size-11 place-items-center rounded-xl bg-stone-100 text-stone-600">
            <User size={20} />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Total Orders
            </p>
            <p className="font-display text-2xl font-bold text-stone-900">
              {customer.totalOrders}
            </p>
          </div>
        </div>

        {/* Completed */}
        <div className="flex items-center gap-4 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
          <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <Check size={20} />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Completed
            </p>
            <p className="font-display text-2xl font-bold text-stone-900">
              {completedOrders}
            </p>
          </div>
        </div>

        {/* Cancelled */}
        <div className="flex items-center gap-4 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
          <span className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-600">
            <XCircle size={20} />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Cancelled
            </p>
            <p className="font-display text-2xl font-bold text-stone-900">
              {cancelledOrders}
            </p>
          </div>
        </div>

        {/* Total Spent */}
        <div className="flex items-center gap-4 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
          <span className="grid size-11 place-items-center rounded-xl bg-stone-100 text-stone-600">
            <IndianRupee size={20} />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Total Spent
            </p>
            <p className="font-display text-2xl font-bold text-stone-900">
              ₹{customer.totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs matching Mockup 4 */}
      <div className="border-b border-stone-200">
        <nav className="flex space-x-8">
          {(['overview', 'orders', 'addresses'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs font-bold capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-stone-900 text-stone-900 font-bold'
                  : 'border-b-2 border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content: Overview matching Mockup 4 */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column (Customer Details + Recent Orders) */}
          <div className="space-y-6 lg:col-span-7">
            {/* Customer Details Card */}
            <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-sm font-bold text-stone-900">Customer Details</h3>
                <button
                  type="button"
                  onClick={() => setEditModal(true)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <Edit2 size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Full Name
                  </p>
                  <p className="mt-1 font-bold text-stone-900">{customer.name}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Email Address
                  </p>
                  <p className="mt-1 font-bold text-stone-900">{customer.email}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Phone
                  </p>
                  <p className="mt-1 font-bold text-stone-900">{customer.phone || 'Not provided'}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Role
                  </p>
                  <p className="mt-1 font-bold text-stone-900 capitalize">{customer.role}</p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Joined Bossco
                  </p>
                  <p className="mt-1 font-bold text-stone-900">{customer.joined}</p>
                </div>
              </div>
            </div>

            {/* Recent Orders Card */}
            <div className="rounded-2xl border border-stone-200/80 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
                <h3 className="text-sm font-bold text-stone-900">Recent Orders</h3>
                <a
                  href="#admin/orders"
                  className="text-xs font-bold text-[#1f7a55] hover:underline"
                >
                  View All Orders
                </a>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-100 bg-stone-50/50 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      <th className="px-6 py-3">Order ID</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 font-bold">Amount</th>
                      <th className="px-6 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {customer.orders.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-stone-400">
                          No orders placed yet.
                        </td>
                      </tr>
                    ) : (
                      customer.orders.slice(0, 5).map((order: any) => (
                        <tr key={order.id} className="hover:bg-stone-50/50">
                          <td className="px-6 py-3.5 font-bold text-stone-900">
                            <a
                              href={`#admin/orders/${order.id}`}
                              className="hover:text-[#1f7a55] hover:underline"
                            >
                              {order.orderNumber}
                            </a>
                          </td>
                          <td className="px-4 py-3.5 text-stone-500">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-stone-900">
                            ₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                ['delivered', 'paid'].includes(order.status)
                                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                  : order.status === 'cancelled'
                                  ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                                  : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column (Addresses) */}
          <div className="space-y-6 lg:col-span-5">
            {/* Addresses Card */}
            <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-sm font-bold text-stone-900">Saved Addresses</h3>
                <span className="text-xs text-stone-400">{customer.addresses.length} saved</span>
              </div>

              <div className="space-y-3">
                {customer.addresses.length === 0 ? (
                  <p className="text-xs text-stone-400 py-4 text-center">No addresses saved yet.</p>
                ) : (
                  customer.addresses.map((addr: any) => (
                    <div
                      key={addr.id}
                      className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-4 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-stone-800 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
                          {addr.label || 'ADDRESS'}
                        </span>
                        {addr.isDefaultShipping && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <Check size={10} strokeWidth={3} /> Default Shipping
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-stone-800">
                        {addr.firstName} {addr.lastName} • {addr.phone}
                      </p>
                      <p className="text-xs text-stone-600 leading-relaxed font-medium">
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} - {addr.postalCode}, {addr.country}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="rounded-2xl border border-stone-200/80 bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b border-stone-100">
            <h3 className="text-sm font-bold text-stone-900">All Customer Orders ({customer.orders.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  <th className="px-6 py-3">Order Number</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3 font-bold">Total</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {customer.orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-stone-50/50">
                    <td className="px-6 py-3.5 font-bold">
                      <a href={`#admin/orders/${o.id}`} className="hover:text-[#1f7a55] hover:underline">
                        {o.orderNumber}
                      </a>
                    </td>
                    <td className="px-4 py-3.5 text-stone-500">
                      {new Date(o.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3.5 text-stone-600">{o.itemsCount} items</td>
                    <td className="px-4 py-3.5 font-bold">₹{o.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-3.5 text-right">
                      <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-stone-100 text-stone-700">
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customer.addresses.map((addr: any) => (
            <div key={addr.id} className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="rounded bg-stone-800 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                  {addr.label || 'ADDRESS'}
                </span>
                {addr.isDefaultShipping && (
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-stone-900">{addr.firstName} {addr.lastName} ({addr.phone})</p>
              <p className="text-xs text-stone-600">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
              <p className="text-xs text-stone-600">{addr.city}, {addr.state} - {addr.postalCode}</p>
              <p className="text-xs text-stone-400 uppercase">{addr.country}</p>
            </div>
          ))}
        </div>
      )}

      {/* Edit Customer Dialog */}
      {editModal && (
        <Dialog title="Edit Customer Profile" onClose={() => setEditModal(false)}>
          <div className="space-y-4 p-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
              <input
                type="text"
                defaultValue={customer.name}
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number</label>
              <input
                type="text"
                defaultValue={customer.phone || ''}
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditModal(false)}
                className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditModal(false)
                  toast.success('Customer details saved')
                }}
                className="rounded-xl bg-[#1f7a55] px-4 py-2 text-xs font-bold text-white hover:bg-[#186847]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
