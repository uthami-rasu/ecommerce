import { useState } from 'react'
import { ArrowLeft, CircleDollarSign, CreditCard, History, LifeBuoy, MapPin, Radio, ReceiptText, XCircle } from 'lucide-react'
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
import { OrderProgress } from '../../components/orders/OrderProgress'
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge'
import { OrderTimeline } from '../../components/orders/OrderTimeline'
import { ShipmentCard } from '../../components/orders/ShipmentCard'
import { isActive, isCancellable, isNotFound, isPayable, paymentMethodLabel } from '../../components/orders/orderHelpers'
import { PAYMENT_STATUS_LABEL, SHIPPING_METHOD_LABEL } from '../../constants/orderStatus'
import { ordersApi, useCancelOrderMutation, useGetOrderQuery } from '../../features/orders/ordersApi'
import { errorMessage } from '../../lib/http/apiClient'
import type { Order } from '../../types/api'
import { formatDate, formatDateTime } from '../../utils/format'
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
            <Panel title="Tracking" subtitle={order.status === 'cancelled' ? 'Cancelled' : `${SHIPPING_METHOD_LABEL[order.shippingMethod]} delivery`}>
              <div className="pt-2 md:px-2 md:pb-2"><OrderProgress order={order} /></div>
            </Panel>
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
                <dd className="font-bold text-stone-800 dark:text-stone-100">{order.paymentStatus ? PAYMENT_STATUS_LABEL[order.paymentStatus] : 'Not paid'}</dd>
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
