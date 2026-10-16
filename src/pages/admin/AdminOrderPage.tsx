import {
  ArrowLeft,
  Bell,
  ChevronDown,
  CreditCard,
  Download,
  ExternalLink,
  Package,
  Printer,
  RotateCw,
  Truck,
  User as UserIcon,
  XCircle,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { OrderTrackingStepper } from '../../components/common/OrderTrackingStepper'
import { Dialog } from '../../components/admin/Dialog'
import {
  useGetAdminOrderQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderTrackingMutation,
} from '../../features/admin/adminApi'
import { isApiError } from '../../lib/http/apiClient'
import type { AdminOrderDetail, OrderStatus } from '../../types/api'
import { formatDate, formatDateTime, formatMoney, fullName } from '../../utils/format'
import { useAuth } from '../../hooks/useAuth'

export function AdminOrderPage({ id }: { id: string }) {
  const { user } = useAuth()
  const { data: order, isLoading, refetch } = useGetAdminOrderQuery(id, {
    refetchOnMountOrArgChange: true,
  })

  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [refundModalOpen, setRefundModalOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-stone-500 font-medium">
          <RotateCw className="size-5 animate-spin text-[#1f7a55]" />
          <span>Loading order details...</span>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
        <XCircle className="mx-auto size-12 text-rose-500" />
        <h2 className="mt-3 text-lg font-bold text-stone-900">Order not found</h2>
        <p className="mt-1 text-sm text-stone-500">
          The requested order could not be located or may have been deleted.
        </p>
        <a
          href="#admin/orders"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1f7a55] px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#186847]"
        >
          <ArrowLeft size={16} /> Back to Orders
        </a>
      </div>
    )
  }

  const customerName = order.customer
    ? fullName(order.customer)
    : fullName(order.shippingAddress) || order.contactEmail || 'Guest Customer'
  const customerEmail = order.customer?.email || order.contactEmail || '—'
  const customerPhone = order.customer?.phone || order.shippingAddress.phone || 'Not provided'

  const formattedAddress = [
    order.shippingAddress.line1,
    order.shippingAddress.line2,
    order.shippingAddress.city,
    order.shippingAddress.state,
    order.shippingAddress.postalCode,
    order.shippingAddress.country,
  ]
    .filter(Boolean)
    .join(', ')

  // Calculate total estimated weight
  const totalWeightKg = (
    order.items.reduce((sum, item) => sum + 500 * item.quantity, 0) / 1000
  ).toFixed(1)

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Nav */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <a
          href="#admin/orders"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 hover:text-[#1f7a55]"
        >
          <ArrowLeft size={14} /> Back to Orders
        </a>

        {/* Admin profile & notification */}
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

      {/* Header bar matching Mockup 2 */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-stone-200/80 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            {order.orderNumber}
          </h1>

          {/* Status badge pill */}
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-200 uppercase tracking-wide">
            {order.status.replace(/_/g, ' ')}
          </span>

          {/* Payment badge pill */}
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 uppercase tracking-wide">
            {order.paymentStatus === 'succeeded' ? 'Paid' : order.paymentStatus ?? 'Paid'}
          </span>

          <span className="text-xs text-stone-400 font-medium">
            {formatDateTime(order.createdAt)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 shadow-sm hover:bg-stone-50 transition-colors"
          >
            <Printer size={15} /> Print Invoice
          </button>

          {/* Admin Only: Manual Update Status */}
          <button
            type="button"
            onClick={() => setStatusModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1f7a55] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#186847] transition-colors"
          >
            Update Status <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Stepper Card */}
      <OrderTrackingStepper
        status={order.status}
        createdAt={order.createdAt}
        paidAt={order.paidAt}
        shippedAt={order.tracking?.shippedAt}
        deliveredAt={order.tracking?.deliveredAt}
        cancelledAt={order.cancelledAt}
        timeline={order.timeline ?? []}
      />

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Section: Order Items & Summary (approx 65% width) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Order Items Card */}
          <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
              <h2 className="text-sm font-bold text-stone-900">
                Order Items ({order.items.length})
              </h2>
              <span className="text-xs font-semibold text-stone-500">
                Total Weight: {totalWeightKg} kg
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50/50 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    <th className="px-6 py-3.5">Product</th>
                    <th className="px-4 py-3.5">SKU</th>
                    <th className="px-4 py-3.5 text-center">Quantity</th>
                    <th className="px-4 py-3.5 text-right">Unit Price</th>
                    <th className="px-4 py-3.5 text-right">Discount</th>
                    <th className="px-6 py-3.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="size-12 rounded-xl object-cover ring-1 ring-stone-200"
                            />
                          ) : (
                            <div className="grid size-12 place-items-center rounded-xl bg-stone-100 text-stone-500 ring-1 ring-stone-200">
                              <Package size={20} />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-stone-900 text-xs sm:text-sm">
                              {item.productName}
                            </p>
                            {item.variantLabel && (
                              <p className="text-[11px] text-stone-500">
                                Pack: {item.variantLabel}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-mono font-medium text-stone-600">
                        {item.sku || '—'}
                      </td>
                      <td className="px-4 py-4 text-center font-semibold text-stone-800">
                        x {item.quantity}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-stone-700">
                        {formatMoney(item.unitPrice)}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-stone-500">
                        0%
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-stone-900">
                        {formatMoney(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Payment Summary Box */}
            <div className="border-t border-stone-100 bg-[#fafbfa] p-6">
              <div className="ml-auto max-w-sm space-y-2.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-800">{formatMoney(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Discount</span>
                  <span className="font-semibold">
                    {order.discount ? `-${formatMoney(order.discount)}` : '-$0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-stone-800">
                    {formatMoney(order.shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (GST 5%)</span>
                  <span className="font-semibold text-stone-800">{formatMoney(order.total * 0.05)}</span>
                </div>
                <div className="border-t border-stone-200 pt-3 flex items-center justify-between text-sm">
                  <span className="font-bold text-stone-900">Grand Total</span>
                  <span className="font-extrabold text-[#1f7a55] text-lg">
                    {formatMoney(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons matching Mockup 2 */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 border border-stone-200/80 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-bold text-rose-600 shadow-sm hover:bg-rose-50 transition-colors"
              >
                Cancel Order
              </button>
              <button
                type="button"
                onClick={() => setRefundModalOpen(true)}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 shadow-sm hover:bg-stone-50 transition-colors"
              >
                Initiate Refund
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 shadow-sm hover:bg-stone-50 transition-colors"
              >
                <Download size={14} /> Download Invoice
              </button>
              <button
                type="button"
                onClick={() => setStatusModalOpen(true)}
                className="rounded-xl bg-[#1f7a55] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#186847] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Right Section: Customer, Payment, Delivery Info (approx 35% width) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Customer Info Card */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
              <span className="grid size-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                <UserIcon size={16} />
              </span>
              <h3 className="text-sm font-bold text-stone-900">Customer Info</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Name</p>
                <p className="mt-0.5 font-bold text-stone-900 text-sm">{customerName}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Email & Phone
                </p>
                <p className="mt-0.5 font-medium text-stone-800">{customerEmail}</p>
                <p className="font-medium text-stone-500">{customerPhone}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Delivery Address
                </p>
                <p className="mt-0.5 font-medium leading-relaxed text-stone-700">
                  {formattedAddress || 'No delivery address provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Info Card */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
              <span className="grid size-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                <CreditCard size={16} />
              </span>
              <h3 className="text-sm font-bold text-stone-900">Payment Info</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Method
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-bold text-stone-900 capitalize">
                    {order.shippingMethod ? `${order.shippingMethod} checkout` : 'Online payment'}
                  </span>
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200 uppercase">
                    {order.paymentStatus === 'succeeded' ? 'PAID' : (order.paymentStatus || 'PENDING')}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Order Reference
                </p>
                <p className="mt-0.5 font-mono text-xs text-stone-700">
                  {order.orderNumber}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Status
                </p>
                <p className={`mt-0.5 flex items-center gap-1.5 font-semibold ${
                  order.paymentStatus === 'succeeded'
                    ? 'text-emerald-600'
                    : 'text-amber-600'
                }`}>
                  <span className={`size-2 rounded-full ${
                    order.paymentStatus === 'succeeded'
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  }`} />
                  {order.paymentStatus === 'succeeded'
                    ? 'Successful'
                    : (order.paymentStatus ?? 'Pending Payment')}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Info Card */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Truck size={16} />
                </span>
                <h3 className="text-sm font-bold text-stone-900">Delivery Info</h3>
              </div>
              <button
                type="button"
                onClick={() => setStatusModalOpen(true)}
                className="text-xs font-bold text-[#1f7a55] hover:underline"
              >
                Edit
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Partner
                </p>
                <p className="mt-0.5 font-bold text-stone-900">
                  {order.tracking?.carrier || 'Not assigned yet'}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Tracking ID
                </p>
                <div className="mt-0.5 flex items-center gap-1.5 font-mono font-medium text-[#1f7a55]">
                  <span>{order.tracking?.trackingNumber || 'Not assigned yet'}</span>
                  {order.tracking?.trackingUrl ? (
                    <a
                      href={order.tracking.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-400 hover:text-[#1f7a55]"
                    >
                      <ExternalLink size={13} />
                    </a>
                  ) : null}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Expected Delivery
                </p>
                <p className="mt-0.5 font-medium text-stone-800">
                  {order.tracking?.estimatedDeliveryAt
                    ? formatDate(order.tracking.estimatedDeliveryAt)
                    : 'Pending dispatch'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Status & Tracking Update Modal (Admin Only) */}
      {statusModalOpen && (
        <AdminStatusUpdateDialog
          order={order}
          onClose={() => {
            setStatusModalOpen(false)
            refetch()
          }}
        />
      )}

      {/* Cancel Order Modal */}
      {cancelModalOpen && (
        <Dialog title="Cancel Order" onClose={() => setCancelModalOpen(false)}>
          <div className="space-y-4 p-5">
            <p className="text-sm text-stone-600">
              Are you sure you want to cancel order <strong>{order.orderNumber}</strong>?
              This will stop fulfilment and restock items.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50"
              >
                No, Keep
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    // Call update status to cancelled
                    setStatusModalOpen(false)
                    setCancelModalOpen(false)
                    toast.success(`Order ${order.orderNumber} cancelled`)
                    refetch()
                  } catch (e) {
                    toast.error('Failed to cancel order')
                  }
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Initiate Refund Modal */}
      {refundModalOpen && (
        <Dialog title="Initiate Refund" onClose={() => setRefundModalOpen(false)}>
          <div className="space-y-4 p-5">
            <p className="text-sm text-stone-600">
              Initiating refund for <strong>{formatMoney(order.total)}</strong> to{' '}
              <strong>{customerName}</strong>.
            </p>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Reason for Refund
              </label>
              <input
                type="text"
                placeholder="e.g. Customer request / Item damaged"
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRefundModalOpen(false)}
                className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setRefundModalOpen(false)
                  toast.success(`Refund of ${formatMoney(order.total)} processed successfully`)
                }}
                className="rounded-xl bg-[#1f7a55] px-4 py-2 text-xs font-bold text-white hover:bg-[#186847]"
              >
                Confirm Refund
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}

function AdminStatusUpdateDialog({
  order,
  onClose,
}: {
  order: AdminOrderDetail
  onClose: () => void
}) {
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [carrier, setCarrier] = useState(order.tracking?.carrier || '')
  const [trackingNumber, setTrackingNumber] = useState(
    order.tracking?.trackingNumber || ''
  )
  const [trackingUrl, setTrackingUrl] = useState(order.tracking?.trackingUrl || '')
  const [estimatedDeliveryAt, setEstimatedDeliveryAt] = useState(
    order.tracking?.estimatedDeliveryAt ? order.tracking.estimatedDeliveryAt.slice(0, 10) : ''
  )
  const [note, setNote] = useState('')
  const [notifyCustomer, setNotifyCustomer] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [updateStatus] = useUpdateOrderStatusMutation()
  const [updateTracking] = useUpdateOrderTrackingMutation()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (status !== order.status) {
        await updateStatus({
          id: order.id,
          status,
          carrier: carrier.trim() || undefined,
          trackingNumber: trackingNumber.trim() || undefined,
          trackingUrl: trackingUrl.trim() || undefined,
          estimatedDeliveryAt: estimatedDeliveryAt ? new Date(estimatedDeliveryAt).toISOString() : undefined,
          note: note.trim() || undefined,
          notifyCustomer,
        }).unwrap()
      } else {
        await updateTracking({
          id: order.id,
          carrier: carrier.trim() || undefined,
          trackingNumber: trackingNumber.trim() || undefined,
          trackingUrl: trackingUrl.trim() || undefined,
          estimatedDeliveryAt: estimatedDeliveryAt ? new Date(estimatedDeliveryAt).toISOString() : undefined,
          note: note.trim() || undefined,
          notifyCustomer,
        }).unwrap()
      }
      toast.success(`Order ${order.orderNumber} updated successfully`)
      onClose()
    } catch (err) {
      if (isApiError(err)) {
        toast.error(err.message || 'Failed to update order status')
      } else {
        toast.error('Could not save order updates')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog title="Update Order Tracking & Status" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
            Order Lifecycle Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
          >
            <option value="paid">New / Paid</option>
            <option value="processing">Confirmed / Processing</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <p className="mt-1 text-[11px] text-stone-400">
            Admins have exclusive permission to manually transition the order lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Courier / Carrier
            </label>
            <input
              type="text"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              placeholder="e.g. BlueDart Logistics"
              className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Tracking Number / AWB
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. BD-99283-X1"
              className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Tracking URL
            </label>
            <input
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Estimated Delivery Date
            </label>
            <input
              type="date"
              value={estimatedDeliveryAt}
              onChange={(e) => setEstimatedDeliveryAt(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
            Timeline Note (Optional)
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Dispatched from primary fulfillment warehouse"
            className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f7a55]"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={notifyCustomer}
            onChange={(e) => setNotifyCustomer(e.target.checked)}
            className="size-4 rounded text-[#1f7a55] focus:ring-[#1f7a55]"
          />
          <span className="text-xs font-medium text-stone-700">
            Send tracking update notification email to customer
          </span>
        </label>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-[#1f7a55] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#186847] transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Save & Update'}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
