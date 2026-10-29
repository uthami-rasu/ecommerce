import { useState } from 'react'
import { ArrowLeft, CircleDollarSign, CreditCard, FileText, History, LifeBuoy, MapPin, Printer, Radio, ReceiptText, X, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Panel } from '../../components/checkout/Panel'
import { PriceRows } from '../../components/checkout/PriceRows'
import { Skeleton } from '../../components/checkout/Skeleton'
import { Footer } from '../../components/layout/Footer'
import { AddressCard } from '../../components/orders/AddressCard'
import { CancelOrderDialog } from '../../components/orders/CancelOrderDialog'
import { DeliveryEstimateCard } from '../../components/orders/DeliveryEstimateCard'
import { OrderItemsCard } from '../../components/orders/OrderItemsCard'
import { OrderNotFound } from '../../components/orders/OrderNotFound'
import { OrderTrackingStepper } from '../../components/common/OrderTrackingStepper'
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge'
import { OrderTimeline } from '../../components/orders/OrderTimeline'
import { ShipmentCard } from '../../components/orders/ShipmentCard'
import { isActive, isCancellable, isNotFound, isPayable, paymentMethodLabel } from '../../components/orders/orderHelpers'
import { PAYMENT_STATUS_LABEL } from '../../constants/orderStatus'
import { ordersApi, useCancelOrderMutation, useGetOrderQuery } from '../../features/orders/ordersApi'
import { errorMessage } from '../../lib/http/apiClient'
import type { Order } from '../../types/api'
import { formatDate, formatDateTime, formatMoney, fullName } from '../../utils/format'
import '../../styles/checkout.css'

const POLL_MS = 30_000

export function OrderDetailPage({ orderNumber }: { orderNumber: string }) {
  // Poll only while the order is moving (read the cached status first to choose the interval).
  const cached = ordersApi.endpoints.getOrder.useQueryState(orderNumber)
  const live = cached.data ? isActive(cached.data.status) : false
  const { data: order, isLoading, error, refetch } = useGetOrderQuery(orderNumber, {
    pollingInterval: live ? POLL_MS : 0,
    skipPollingIfUnfocused: true,
    refetchOnMountOrArgChange: true,
  })

  let content
  if (isLoading) content = <DetailSkeleton />
  else if (!order) {
    content = (
      <div className="pt-6">
        {isNotFound(error)
          ? <OrderNotFound orderNumber={orderNumber} />
          : <OrderNotFound orderNumber={orderNumber} error={errorMessage(error)} onRetry={refetch} />}
      </div>
    )
  } else content = <OrderDetail order={order} live={live} />

  return (
    <>
      <main className="checkout-page min-h-[75vh] text-stone-800 dark:text-stone-100">
        <div className="relative z-10 mx-auto w-full max-w-[1180px] px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
          <a href="#account/orders" className="inline-flex items-center gap-1.5 rounded-full px-1 text-sm font-semibold text-stone-500 transition hover:text-[#173f32] dark:text-stone-400 dark:hover:text-amber-200">
            <ArrowLeft size={15} aria-hidden /> My orders
          </a>
          {content}
        </div>
      </main>
      <Footer />
    </>
  )
}

function OrderDetail({ order, live }: { order: Order; live: boolean }) {
  const [confirming, setConfirming] = useState(false)
  const [invoiceOpen, setInvoiceOpen] = useState(false)
  const [cancelOrder, cancelState] = useCancelOrderMutation()
  const payable = isPayable(order.status)

  const cancel = async () => {
    try {
      await cancelOrder(order.orderNumber).unwrap()
      toast.success('Order cancelled', { description: order.orderNumber })
      setConfirming(false)
    } catch (err) {
      toast.error('Could not cancel the order', { description: errorMessage(err) })
    }
  }

  const sameBilling = JSON.stringify(order.billingAddress) === JSON.stringify(order.shippingAddress)

  return (
    <div className="checkout-fade-in">
      <header className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#aa753a]">Order</p>
          <h1 className="mt-1 break-all font-display text-[2.4rem] font-bold leading-none text-[#173f32] sm:text-[3rem] dark:text-stone-50">{order.orderNumber}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-stone-500 dark:text-stone-400">
            <OrderStatusBadge status={order.status} />
            <span>Placed {formatDateTime(order.createdAt)}</span>
            {live && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400" title="This page refreshes automatically">
                <Radio size={13} className="animate-pulse" aria-hidden /> Live updates
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setInvoiceOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm font-bold text-stone-700 shadow-sm transition hover:border-[#173f32] hover:text-[#173f32] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
          >
            <Printer size={15} aria-hidden /> Invoice
          </button>
          {payable && (
            <a href={`#pay/${order.orderNumber}`} className="inline-flex items-center gap-2 rounded-full bg-[#173f32] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#1e5040] dark:bg-amber-300 dark:text-stone-900">
              <CreditCard size={15} aria-hidden /> Pay now
            </a>
          )}
          {isCancellable(order.status) && (
            <button type="button" onClick={() => setConfirming(true)} className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-5 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900 dark:bg-stone-900 dark:text-rose-300 dark:hover:bg-rose-950/40">
              <XCircle size={15} aria-hidden /> Cancel order
            </button>
          )}
          <a href="#contact" className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm font-bold text-stone-700 transition hover:border-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200">
            <LifeBuoy size={15} aria-hidden /> Need help?
          </a>
        </div>
      </header>

      {payable && (
        <div className={`mt-6 flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm ${order.status === 'payment_failed' ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300' : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300'}`} role="status">
          <CircleDollarSign size={18} className="mt-0.5 flex-none" aria-hidden />
          <p>
            <b className="font-bold">{order.status === 'payment_failed' ? 'Your last payment attempt failed.' : 'This order is awaiting payment.'}</b>{' '}
            Complete the payment to confirm it — we’ll start packing right away.
          </p>
        </div>
      )}

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
        <div className="grid min-w-0 gap-6">
          <div className="lg:hidden"><DeliveryEstimateCard order={order} /></div>
          {!payable && (
            <div className="overflow-hidden">
              <OrderTrackingStepper
                status={order.status}
                createdAt={order.createdAt}
                paidAt={order.paidAt}
                shippedAt={order.tracking?.shippedAt}
                deliveredAt={order.tracking?.deliveredAt}
                cancelledAt={order.cancelledAt}
                timeline={order.timeline ?? []}
              />
            </div>
          )}
          <OrderItemsCard order={order} />
          <Panel title="Activity" icon={<History size={17} />}>
            <OrderTimeline order={order} />
          </Panel>
        </div>

        <div className="grid min-w-0 gap-6 lg:sticky lg:top-32">
          <div className="hidden lg:block"><DeliveryEstimateCard order={order} /></div>
          {!payable && <ShipmentCard order={order} />}
          <Panel title="Payment" icon={<ReceiptText size={17} />}>
            <PriceRows subtotal={order.subtotal} discount={order.discount} couponCode={order.couponCode} shippingFee={order.shippingFee} total={order.total} />
            <dl className="mt-4 grid gap-2 border-t border-stone-200 pt-4 text-sm dark:border-stone-800">
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500 dark:text-stone-400">Status</dt>
                <dd className="font-bold text-stone-800 dark:text-stone-100">{order.paymentStatus ? PAYMENT_STATUS_LABEL[order.paymentStatus] : order.paidAt ? 'Paid' : 'Not paid'}</dd>
              </div>
              {order.paidAt && (
                <>
                  <div className="flex justify-between gap-4">
                    <dt className="text-stone-500 dark:text-stone-400">Paid on</dt>
                    <dd className="text-right font-semibold text-stone-700 dark:text-stone-200">{formatDate(order.paidAt, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-stone-500 dark:text-stone-400">Method</dt>
                    <dd className="font-semibold text-stone-700 dark:text-stone-200">{paymentMethodLabel}</dd>
                  </div>
                </>
              )}
            </dl>
          </Panel>
          <Panel title="Addresses" icon={<MapPin size={17} />}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              <AddressCard title={order.shippingMethod === 'pickup' ? 'Contact' : 'Shipping to'} address={order.shippingAddress} />
              <AddressCard title="Billing" address={order.billingAddress} note={sameBilling ? 'Same as shipping address' : undefined} />
            </div>
            <p className="mt-5 border-t border-stone-200 pt-4 text-xs text-stone-500 dark:border-stone-800 dark:text-stone-400">
              Updates are sent to <b className="font-semibold text-stone-700 dark:text-stone-200">{order.contactEmail}</b>
            </p>
            {order.notes && (
              <p className="mt-3 rounded-xl bg-stone-50 px-3 py-2 text-[13px] text-stone-600 dark:bg-stone-800/60 dark:text-stone-300">
                <span className="font-bold">Your note:</span> {order.notes}
              </p>
            )}
          </Panel>
        </div>
      </div>

      <CancelOrderDialog orderNumber={order.orderNumber} open={confirming} busy={cancelState.isLoading} onConfirm={cancel} onClose={() => setConfirming(false)} />
      {invoiceOpen && <CustomerInvoiceModal order={order} onClose={() => setInvoiceOpen(false)} />}
    </div>
  )
}

function CustomerInvoiceModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-10 dark:bg-stone-900 dark:border dark:border-stone-800">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-[#173f32] dark:bg-emerald-950 dark:text-emerald-300">
              <FileText size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-white">Tax Invoice</h2>
              <p className="text-xs text-stone-500">Order #{order.orderNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl bg-[#173f32] px-4 py-2 text-xs font-bold text-white hover:bg-[#1e5040] shadow-sm transition-colors"
            >
              <Printer size={14} /> Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="grid size-9 place-items-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="mt-6 space-y-6 text-xs text-stone-700 dark:text-stone-300">
          {/* Brand header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 pb-5 dark:border-stone-800">
            <div>
              <p className="font-display text-2xl font-black tracking-tight text-[#173f32] dark:text-amber-200">
                BOSSCO · NUTRISTOCK
              </p>
              <p className="text-[11px] text-stone-500">Pure, Raw &amp; Traceable Organic Harvest</p>
              <p className="mt-1 text-[11px] text-stone-400">GSTIN: 27AABCB1234F1Z5 • support@bossco.local</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-bold text-stone-900 dark:text-stone-100">
                INV-{order.orderNumber}
              </p>
              <p className="text-stone-500">Date: {formatDate(order.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              <p className="text-stone-500 capitalize">Payment Status: <b className="text-emerald-600">{order.paymentStatus || 'Paid'}</b></p>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-stone-50/70 p-4 rounded-2xl dark:bg-stone-800/50">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                Billed To
              </p>
              <p className="font-bold text-stone-900 dark:text-stone-100">{fullName(order.billingAddress ?? order.shippingAddress)}</p>
              <p>{(order.billingAddress ?? order.shippingAddress).line1}</p>
              {(order.billingAddress ?? order.shippingAddress).line2 && <p>{(order.billingAddress ?? order.shippingAddress).line2}</p>}
              <p>{(order.billingAddress ?? order.shippingAddress).city}, {(order.billingAddress ?? order.shippingAddress).state} - {(order.billingAddress ?? order.shippingAddress).postalCode}</p>
              <p className="text-stone-500">Phone: {(order.billingAddress ?? order.shippingAddress).phone}</p>
              <p className="text-stone-500">Email: {order.contactEmail}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                Shipped To
              </p>
              <p className="font-bold text-stone-900 dark:text-stone-100">{fullName(order.shippingAddress)}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
              <p className="text-stone-500">Phone: {order.shippingAddress.phone}</p>
              <p className="text-stone-500">Delivery: <span className="capitalize">{order.shippingMethod} delivery</span></p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-100/60 text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:bg-stone-800/80">
                  <th className="px-4 py-3">Item Description</th>
                  <th className="px-3 py-3 text-center">Variant</th>
                  <th className="px-3 py-3 text-center">Qty</th>
                  <th className="px-3 py-3 text-right">Unit Price</th>
                  <th className="px-4 py-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-semibold text-stone-900 dark:text-stone-100">
                      {item.productName}
                    </td>
                    <td className="px-3 py-3 text-center text-stone-500">{item.variantLabel}</td>
                    <td className="px-3 py-3 text-center font-bold text-stone-900 dark:text-stone-100">{item.quantity}</td>
                    <td className="px-3 py-3 text-right text-stone-600 dark:text-stone-400">{formatMoney(item.unitPrice)}</td>
                    <td className="px-4 py-3 text-right font-bold text-stone-900 dark:text-stone-100">{formatMoney(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex flex-col items-end gap-1.5 pt-2">
            <div className="flex w-64 justify-between text-xs">
              <span className="text-stone-500">Subtotal:</span>
              <span className="font-semibold">{formatMoney(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex w-64 justify-between text-xs text-emerald-600">
                <span>Discount ({order.couponCode || 'Coupon'}):</span>
                <span>-{formatMoney(order.discount)}</span>
              </div>
            )}
            <div className="flex w-64 justify-between text-xs">
              <span className="text-stone-500">Shipping:</span>
              <span className="font-semibold">{order.shippingFee ? formatMoney(order.shippingFee) : 'FREE'}</span>
            </div>
            <div className="mt-2 flex w-64 justify-between border-t border-stone-200 pt-2 text-sm font-bold text-stone-900 dark:border-stone-800 dark:text-white">
              <span>Total Paid:</span>
              <span className="text-base text-[#173f32] dark:text-amber-300">{formatMoney(order.total)}</span>
            </div>
          </div>

          {/* Footer notes */}
          <div className="border-t border-stone-100 pt-4 text-[11px] text-stone-400 text-center dark:border-stone-800">
            Thank you for trusting Bossco NutriStock with your organic harvest needs. For any questions, contact us at support@bossco.local.
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="mt-6" role="status" aria-label="Loading order">
      <Skeleton className="h-12 w-72" />
      <Skeleton className="mt-4 h-6 w-56 rounded-full" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
        <div className="grid gap-6">
          <Skeleton className="h-44 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-36 rounded-3xl" />
          <Skeleton className="h-56 rounded-3xl" />
        </div>
      </div>
    </div>
  )
}
