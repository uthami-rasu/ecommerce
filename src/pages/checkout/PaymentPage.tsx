import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  Building2,
  Check,
  CreditCard,
  Lock,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
  Wallet,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAppDispatch } from '../../app/hooks'
import { CardPaymentForm } from '../../components/checkout/CardPaymentForm'
import { defaultExpiry, TEST_CARD_NUMBER, UPI_PATTERN, validateCard, type CardDraft, type CardErrors } from '../../components/checkout/cardUtils'
import { CheckoutShell } from '../../components/checkout/CheckoutShell'
import { PaymentProcessing } from '../../components/checkout/PaymentProcessing'
import { Skeleton } from '../../components/checkout/Skeleton'
import { UpiPaymentForm } from '../../components/checkout/UpiPaymentForm'
import { OrderNotFound } from '../../components/orders/OrderNotFound'
import { isNotFound, isPayable } from '../../components/orders/orderHelpers'
import { ordersApi, useGetOrderQuery, useGetPaymentGatewayQuery } from '../../features/orders/ordersApi'
import { errorMessage } from '../../lib/http/apiClient'
import { payOrder, payWithRazorpay } from '../../services/paymentService'
import { CHECKOUT_DISMISSED } from '../../services/razorpayCheckout'
import type { MockOutcome, Order, Payment, PaymentGateway } from '../../types/api'
import { SHIPPING_METHOD_LABEL } from '../../constants/orderStatus'
import { formatAddress, formatMoney, fullName } from '../../utils/format'
import { navigate } from '../../utils/router'

type Method = 'card' | 'upi'
type Phase = 'idle' | 'opening' | 'processing' | 'success' | 'failed'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function PaymentPage({ orderNumber }: { orderNumber: string }) {
  const { data: order, isLoading, error, refetch } = useGetOrderQuery(orderNumber, { skip: !orderNumber, refetchOnMountOrArgChange: true })
  const gatewayQuery = useGetPaymentGatewayQuery()
  const finished = useRef(false)

  // Already paid / cancelled → redirect to the order page.
  useEffect(() => {
    if (order && !finished.current && !isPayable(order.status)) {
      navigate(`orders/${order.orderNumber}`, { replace: true })
    }
  }, [order])

  let content
  if (isLoading || gatewayQuery.isLoading) {
    content = <PaymentSkeleton />
  } else if (!gatewayQuery.data) {
    content = <OrderNotFound orderNumber={orderNumber} error={errorMessage(gatewayQuery.error)} onRetry={gatewayQuery.refetch} />
  } else if (!order) {
    content = isNotFound(error) || !orderNumber
      ? <OrderNotFound orderNumber={orderNumber} />
      : <OrderNotFound orderNumber={orderNumber} error={errorMessage(error)} onRetry={refetch} />
  } else {
    content = <AmazonCheckoutView order={order} gateway={gatewayQuery.data} onFinished={() => { finished.current = true }} />
  }

  return (
    <CheckoutShell title="Payment" step={2} width="wide" decorations={false}>
      {content}
    </CheckoutShell>
  )
}

function AmazonCheckoutView({
  order,
  gateway,
  onFinished,
}: {
  order: Order
  gateway: PaymentGateway
  onFinished: () => void
}) {
  const dispatch = useAppDispatch()
  const isRazorpay = gateway.provider === 'razorpay'
  const [method, setMethod] = useState<Method>('card')
  const [card, setCard] = useState<CardDraft>(() => ({
    number: TEST_CARD_NUMBER,
    name: fullName(order.billingAddress ?? order.shippingAddress),
    expiry: defaultExpiry(),
    cvv: '123',
  }))
  const [cardErrors, setCardErrors] = useState<CardErrors>({})
  const [upi, setUpi] = useState('')
  const [upiError, setUpiError] = useState<string | undefined>()
  const [phase, setPhase] = useState<Phase>('idle')
  const [failure, setFailure] = useState<string | null>(order.status === 'payment_failed' ? 'Your previous payment attempt didn’t go through.' : null)
  const [attempt, setAttempt] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  const refreshOrder = () => dispatch(ordersApi.util.invalidateTags(['Orders', { type: 'Order', id: order.orderNumber }]))

  const settle = async (payment: Payment) => {
    if (payment.status === 'succeeded') {
      onFinished()
      setPhase('success')
      await wait(900)
      navigate(`order-complete/${order.orderNumber}`)
      refreshOrder()
      return
    }
    if (payment.status === 'pending') {
      onFinished()
      toast.info('Payment is being confirmed', { description: 'Your bank is still confirming the payment. We’ll update your order shortly — please don’t pay again.' })
      navigate(`orders/${order.orderNumber}`)
      refreshOrder()
      return
    }
    setPhase('failed')
    setAttempt((current) => current + 1)
    setDismissed(false)
    setFailure(payment.failureReason ?? 'The payment was not completed.')
    refreshOrder()
  }

  const fail = (err: unknown) => {
    const closedByCustomer = err instanceof Error && 'code' in err && err.code === CHECKOUT_DISMISSED
    setPhase('failed')
    setAttempt((current) => current + 1)
    setDismissed(closedByCustomer)
    setFailure(errorMessage(err))
    if (!closedByCustomer) toast.error('Payment failed', { description: errorMessage(err) })
    refreshOrder()
  }

  const payRazorpay = async () => {
    setPhase('opening')
    setFailure(null)
    try {
      await settle(await payWithRazorpay(order, () => setPhase('processing'), gateway.methods))
    } catch (err) {
      fail(err)
    }
  }

  const pay = async (outcome: MockOutcome) => {
    if (outcome === 'success') {
      if (method === 'card') {
        const errors = validateCard(card)
        setCardErrors(errors)
        if (Object.keys(errors).length) return
      } else if (!UPI_PATTERN.test(upi)) {
        setUpiError('Enter a valid UPI ID, e.g. name@okaxis')
        return
      }
    }
    setPhase('processing')
    setFailure(null)
    try {
      const [payment] = await Promise.all([payOrder(order.orderNumber, outcome), wait(1600)])
      await settle(payment)
    } catch (err) {
      fail(err)
    }
  }

  const submit = (event?: FormEvent) => {
    if (event) event.preventDefault()
    void (isRazorpay ? payRazorpay() : pay('success'))
  }

  const busy = phase === 'opening' || phase === 'processing' || phase === 'success'

  return (
    <div className={`relative ${isRazorpay ? 'pb-24 lg:pb-0' : ''}`}>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_370px] xl:grid-cols-[minmax(0,1fr)_390px]">
        {/* LEFT COLUMN: Amazon-style structured checkout steps */}
        <div className="space-y-6">
          {/* STEP 1: Delivery Address */}
          <section
            aria-labelledby="step-address-heading"
            className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm sm:p-6 dark:border-stone-800 dark:bg-stone-900"
          >
            <div className="flex items-center justify-between gap-4 border-b border-stone-100 pb-3.5 dark:border-stone-800">
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white shadow-sm">
                  <Check size={14} strokeWidth={2.8} />
                </span>
                <h2 id="step-address-heading" className="text-base font-bold text-stone-900 dark:text-stone-100">
                  1. Delivery address
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                Verified
              </span>
            </div>

            <div className="mt-4 pl-10 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
              <p className="font-bold text-stone-900 dark:text-stone-100">{fullName(order.shippingAddress)}</p>
              <p className="mt-0.5">{formatAddress(order.shippingAddress)}</p>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                Contact Phone: <span className="font-semibold text-stone-700 dark:text-stone-300">{order.shippingAddress.phone}</span>
                {order.contactEmail && (
                  <> · Email updates: <span className="font-semibold text-stone-700 dark:text-stone-300">{order.contactEmail}</span></>
                )}
              </p>
            </div>
          </section>

          {/* STEP 2: Payment Method (Active Highlighted Step) */}
          <section
            aria-labelledby="step-payment-heading"
            className="relative rounded-2xl border-2 border-[#173f32] bg-white p-5 shadow-md sm:p-6 dark:border-amber-400/80 dark:bg-stone-900"
          >
            <div className="flex items-center justify-between gap-4 border-b border-stone-100 pb-4 dark:border-stone-800">
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-[#173f32] text-xs font-bold text-white dark:bg-amber-400 dark:text-stone-950">
                  2
                </span>
                <div>
                  <h2 id="step-payment-heading" className="text-base font-bold text-stone-900 dark:text-stone-100">
                    2. Select a payment method
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Encrypted and protected with 256-bit bank-grade security
                  </p>
                </div>
              </div>
              {gateway.testMode && (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900 dark:bg-amber-950/70 dark:text-amber-200">
                  Test Mode
                </span>
              )}
            </div>

            <form onSubmit={submit} noValidate className="mt-5">
              {/* Error Alert */}
              {failure && phase !== 'processing' && (
                <div
                  key={attempt}
                  className={`mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 ${attempt ? 'gateway-shake' : ''}`}
                  role="alert"
                >
                  <XCircle size={18} className="mt-0.5 flex-none" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <b className="block font-bold">{dismissed ? 'Payment not completed' : 'Payment declined'}</b>
                    <span className="text-rose-700/90 dark:text-rose-300/90">{failure}</span>
                    <span className="mt-1 block text-xs text-rose-600/80 dark:text-rose-400/80">Your items are reserved in your order — feel free to try again.</span>
                  </div>
                  {phase === 'failed' && (
                    <button
                      type="button"
                      onClick={() => { setFailure(null); setPhase('idle') }}
                      className="inline-flex flex-none items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-rose-700 shadow-sm ring-1 ring-rose-200 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-200 dark:ring-rose-800"
                    >
                      <RotateCcw size={12} aria-hidden /> Try again
                    </button>
                  )}
                </div>
              )}

              {/* RAZORPAY MODE */}
              {isRazorpay ? (
                <div className="space-y-4">
                  {/* Selected Gateway Box (Amazon Card Style) */}
                  <div className="rounded-xl border border-emerald-300 bg-emerald-50/50 p-4 sm:p-5 dark:border-emerald-800 dark:bg-emerald-950/20">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-4 items-center justify-center rounded-full border-2 border-[#173f32] bg-[#173f32] dark:border-amber-400 dark:bg-amber-400">
                        <div className="size-1.5 rounded-full bg-white dark:bg-stone-900" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-bold text-stone-900 dark:text-stone-100">
                            Razorpay Secure Checkout
                          </p>
                          <span className="inline-flex items-center gap-1 rounded bg-[#0c2340] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#3395ff]">
                            Official Gateway
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-stone-600 dark:text-stone-300">
                          Supports all major Indian payment options. You will complete payment in the secure Razorpay popup:
                        </p>

                        {/* Supported Badges Grid */}
                        <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                          <div className="flex flex-col rounded-lg border border-stone-200/80 bg-white p-2.5 text-xs shadow-xs dark:border-stone-700 dark:bg-stone-800">
                            <span className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-stone-100">
                              <Smartphone size={14} className="text-[#173f32] dark:text-amber-300" /> UPI / QR
                            </span>
                            <span className="text-[10px] text-stone-500 dark:text-stone-400">GPay, PhonePe, Paytm</span>
                          </div>
                          <div className="flex flex-col rounded-lg border border-stone-200/80 bg-white p-2.5 text-xs shadow-xs dark:border-stone-700 dark:bg-stone-800">
                            <span className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-stone-100">
                              <CreditCard size={14} className="text-[#173f32] dark:text-amber-300" /> Cards
                            </span>
                            <span className="text-[10px] text-stone-500 dark:text-stone-400">Visa, Master, RuPay</span>
                          </div>
                          <div className="flex flex-col rounded-lg border border-stone-200/80 bg-white p-2.5 text-xs shadow-xs dark:border-stone-700 dark:bg-stone-800">
                            <span className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-stone-100">
                              <Building2 size={14} className="text-[#173f32] dark:text-amber-300" /> Netbanking
                            </span>
                            <span className="text-[10px] text-stone-500 dark:text-stone-400">All Indian Banks</span>
                          </div>
                          <div className="flex flex-col rounded-lg border border-stone-200/80 bg-white p-2.5 text-xs shadow-xs dark:border-stone-700 dark:bg-stone-800">
                            <span className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-stone-100">
                              <Wallet size={14} className="text-[#173f32] dark:text-amber-300" /> Wallets
                            </span>
                            <span className="text-[10px] text-stone-500 dark:text-stone-400">Amazon Pay & more</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amazon Callout info */}
                  <div className="flex items-start gap-2.5 rounded-xl bg-blue-50/70 p-3.5 text-xs text-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
                    <ShieldCheck size={16} className="mt-0.5 flex-none text-blue-600 dark:text-blue-400" />
                    <p className="leading-relaxed">
                      Clicking <b>Place Order and Pay</b> will securely open Razorpay Checkout on this screen. No extra redirects needed.
                    </p>
                  </div>
                </div>
              ) : (
                /* MOCK MODE */
                <div>
                  <div role="tablist" aria-label="Payment method" className="grid grid-cols-2 gap-2 rounded-xl bg-stone-100 p-1.5 dark:bg-stone-800">
                    {([
                      ['card', 'Credit / Debit Card', CreditCard],
                      ['upi', 'UPI / QR', Smartphone],
                    ] as const).map(([key, label, Icon]) => (
                      <button
                        key={key}
                        type="button"
                        role="tab"
                        id={`pay-tab-${key}`}
                        aria-selected={method === key}
                        aria-controls={`pay-panel-${key}`}
                        onClick={() => setMethod(key)}
                        disabled={busy}
                        className={`flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-[#173f32] ${
                          method === key
                            ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-900 dark:text-amber-200'
                            : 'text-stone-600 hover:text-stone-900 dark:text-stone-400'
                        }`}
                      >
                        <Icon size={16} aria-hidden /> {label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-5" role="tabpanel" id={`pay-panel-${method}`} aria-labelledby={`pay-tab-${method}`}>
                    {method === 'card' ? (
                      <CardPaymentForm value={card} errors={cardErrors} onChange={(next) => { setCard(next); setCardErrors({}) }} disabled={busy} />
                    ) : (
                      <UpiPaymentForm value={upi} error={upiError} onChange={(next) => { setUpi(next); setUpiError(undefined) }} disabled={busy} />
                    )}
                  </div>
                </div>
              )}

              {/* Action Button (phones/tablets use the fixed bar at the bottom instead) */}
              <div className={`mt-6 border-t border-stone-100 pt-5 dark:border-stone-800 ${isRazorpay ? 'hidden lg:block' : ''}`}>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#ffc220] px-6 text-base font-bold text-stone-950 shadow-sm transition hover:bg-[#eab016] active:bg-[#d89e0b] focus-visible:outline-2 focus-visible:outline-[#ffc220] disabled:opacity-50 sm:w-auto sm:min-w-[280px]"
                >
                  <Lock size={16} aria-hidden />{' '}
                  {phase === 'opening'
                    ? 'Opening Razorpay…'
                    : isRazorpay
                      ? `Place Order and Pay · ${formatMoney(order.total)}`
                      : `Pay ${formatMoney(order.total)}`}
                </button>

                {!isRazorpay && (
                  <button
                    type="button"
                    onClick={() => void pay('failure')}
                    disabled={busy}
                    className="mt-3 block text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400"
                  >
                    Simulate a declined payment
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* STEP 3: Review Items and Delivery */}
          <section
            aria-labelledby="step-items-heading"
            className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm sm:p-6 dark:border-stone-800 dark:bg-stone-900"
          >
            <div className="flex items-center gap-3 border-b border-stone-100 pb-3.5 dark:border-stone-800">
              <span className="flex size-7 items-center justify-center rounded-full bg-stone-200 text-xs font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                3
              </span>
              <div>
                <h2 id="step-items-heading" className="text-base font-bold text-stone-900 dark:text-stone-100">
                  3. Review items and shipping
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'} in your shipment
                </p>
              </div>
            </div>

            {/* Delivery Banner */}
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-stone-50 p-3.5 text-xs text-stone-700 dark:bg-stone-800/60 dark:text-stone-300">
              <Truck size={18} className="flex-none text-[#173f32] dark:text-amber-300" aria-hidden />
              <div>
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {order.shippingMethod === 'pickup' ? 'Store pickup' : `${SHIPPING_METHOD_LABEL[order.shippingMethod]} delivery`}
                </span>
                <span className="mx-1.5 text-stone-400">·</span>
                <span>{order.shippingMethod === 'pickup' ? 'We’ll tell you when it’s ready to collect' : 'Packed fresh after you order'}</span>
              </div>
            </div>

            {/* Items List */}
            <ul className="mt-4 divide-y divide-stone-100 dark:divide-stone-800">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 py-3.5">
                  <div className="size-16 flex-none overflow-hidden rounded-xl border border-stone-200 bg-stone-50 p-1 dark:border-stone-700 dark:bg-stone-800">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="size-full rounded-lg object-cover" />
                    ) : (
                      <div className="grid size-full place-items-center text-xs text-stone-400">Item</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                      {item.productName}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                      Variant: <span className="font-medium text-stone-700 dark:text-stone-200">{item.variantLabel}</span> · Qty: <span className="font-bold text-stone-800 dark:text-stone-100">{item.quantity}</span>
                    </p>
                  </div>
                  <div className="flex-none text-right">
                    <p className="text-sm font-extrabold text-stone-900 dark:text-stone-100">{formatMoney(item.lineTotal)}</p>
                    {item.quantity > 1 && (
                      <p className="text-[11px] text-stone-400">{formatMoney(item.unitPrice)} each</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* RIGHT COLUMN: Sticky Amazon-Inspired Order Summary */}
        <aside className="lg:sticky lg:top-28">
          <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            {/* Top Primary Place Order Button (Amazon Pattern) */}
            <button
              type="button"
              onClick={() => submit()}
              disabled={busy}
              className="hidden w-full rounded-xl bg-[#ffc220] py-3.5 px-4 lg:block text-center text-sm font-bold text-stone-950 shadow-sm transition hover:bg-[#eab016] active:bg-[#d89e0b] focus-visible:outline-2 focus-visible:outline-[#ffc220] disabled:opacity-50"
            >
              {phase === 'opening'
                ? 'Opening Razorpay…'
                : isRazorpay
                  ? `Place Your Order and Pay`
                  : `Pay ${formatMoney(order.total)}`}
            </button>
            <p className="mt-2 hidden text-center text-[11px] leading-tight text-stone-500 lg:block dark:text-stone-400">
              By placing your order, you agree to Bossco's Terms of Use and Privacy Policy.
            </p>

            <div className="my-5 hidden border-t border-stone-200 lg:block dark:border-stone-800" />

            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Order Summary</h3>

            <div className="mt-3.5 space-y-2.5 text-sm text-stone-600 dark:text-stone-300">
              <div className="flex justify-between">
                <span>Items ({order.itemCount}):</span>
                <span className="font-medium text-stone-900 dark:text-stone-100">{formatMoney(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span className="font-medium text-stone-900 dark:text-stone-100">
                  {order.shippingFee === 0 ? <span className="font-bold text-emerald-600">FREE</span> : formatMoney(order.shippingFee)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between font-medium text-emerald-600">
                  <span>Promotion applied:</span>
                  <span>-{formatMoney(order.discount)}</span>
                </div>
              )}
            </div>

            <div className="my-4 border-t border-stone-200 dark:border-stone-800" />

            <div className="flex items-baseline justify-between">
              <span className="text-base font-bold text-stone-900 dark:text-stone-100">Order Total:</span>
              <span className="font-display text-2xl font-extrabold text-[#173f32] dark:text-amber-300">
                {formatMoney(order.total)}
              </span>
            </div>

            {order.discount > 0 && (
              <div className="mt-3 rounded-lg bg-emerald-50 py-2 text-center text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                You saved {formatMoney(order.discount)} on this order!
              </div>
            )}

            {/* Reassurance Badges */}
            <div className="mt-6 space-y-2.5 rounded-xl bg-stone-50 p-4 text-xs text-stone-600 dark:bg-stone-800/50 dark:text-stone-300">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="flex-none text-emerald-600 dark:text-emerald-400" />
                <span><b>100% Purchase Protection</b></span>
              </div>
              <div className="flex items-center gap-2">
                <Lock size={16} className="flex-none text-stone-500 dark:text-stone-400" />
                <span><b>256-bit SSL</b> secure encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="flex-none text-amber-600 dark:text-amber-400" />
                <span><b>Certified Pure</b> farm-fresh harvest</span>
              </div>
            </div>

            {/* Helper link */}
            <div className="mt-4 text-center">
              <a
                href={`#orders/${order.orderNumber}`}
                className="text-xs font-semibold text-stone-500 hover:text-stone-900 hover:underline dark:text-stone-400 dark:hover:text-stone-100"
              >
                Order #{order.orderNumber} · Need to pay later?
              </a>
            </div>
          </div>
        </aside>
      </div>

      {/* Phones/tablets: one pay button that never scrolls away */}
      {isRazorpay && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.25)] backdrop-blur lg:hidden dark:border-stone-800 dark:bg-stone-900/95">
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <div className="min-w-0">
              <p className="text-[11px] text-stone-500 dark:text-stone-400">Total</p>
              <p className="text-lg font-extrabold tabular-nums text-stone-900 dark:text-stone-50">{formatMoney(order.total)}</p>
            </div>
            <button
              type="button"
              onClick={() => submit()}
              disabled={busy}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#ffc220] px-4 text-sm font-bold text-stone-950 shadow-sm transition active:bg-[#d89e0b] disabled:opacity-50"
            >
              <Lock size={15} aria-hidden /> {phase === 'opening' ? 'Opening Razorpay…' : 'Place order & pay'}
            </button>
          </div>
        </div>
      )}

      {/* Processing overlay */}
      {(phase === 'processing' || phase === 'success') && <PaymentProcessing success={phase === 'success'} />}
    </div>
  )
}

function PaymentSkeleton() {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_370px]" role="status" aria-label="Loading payment">
      <div className="space-y-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="mt-3 h-14" />
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="mt-4 h-32" />
          <Skeleton className="mt-4 h-12 w-48" />
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
          <Skeleton className="h-6 w-60" />
          <Skeleton className="mt-4 h-24" />
        </div>
      </div>
      <div>
        <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="my-5 h-px w-full" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-4 h-20" />
          <Skeleton className="my-4 h-px w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </div>
  )
}
