import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AlertOctagon, CreditCard, Lock, RotateCcw, ShieldCheck, Smartphone, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAppDispatch } from '../../app/hooks'
import { CardPaymentForm } from '../../components/checkout/CardPaymentForm'
import { defaultExpiry, TEST_CARD_NUMBER, UPI_PATTERN, validateCard, type CardDraft, type CardErrors } from '../../components/checkout/cardUtils'
import { CheckoutShell } from '../../components/checkout/CheckoutShell'
import { Panel } from '../../components/checkout/Panel'
import { PaymentProcessing } from '../../components/checkout/PaymentProcessing'
import { PriceRows } from '../../components/checkout/PriceRows'
import { Skeleton } from '../../components/checkout/Skeleton'
import { SummaryLine } from '../../components/checkout/SummaryLine'
import { UpiPaymentForm } from '../../components/checkout/UpiPaymentForm'
import bosscoLogo from '../../assets/images/Bossco_Logo__2__page-0001-removebg-preview.webp'
import { OrderNotFound } from '../../components/orders/OrderNotFound'
import { isNotFound, isPayable } from '../../components/orders/orderHelpers'
import { ordersApi, useGetOrderQuery } from '../../features/orders/ordersApi'
import { errorMessage } from '../../lib/http/apiClient'
import { payOrder } from '../../services/paymentService'
import type { MockOutcome, Order } from '../../types/api'
import { formatAddress, formatMoney, fullName } from '../../utils/format'
import { navigate } from '../../utils/router'

type Method = 'card' | 'upi'
type Phase = 'idle' | 'processing' | 'success' | 'failed'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function PaymentPage({ orderNumber }: { orderNumber: string }) {
  const { data: order, isLoading, error, refetch } = useGetOrderQuery(orderNumber, { skip: !orderNumber, refetchOnMountOrArgChange: true })
  const finished = useRef(false)

  // Already paid / cancelled → the order page is the right place.
  useEffect(() => {
    if (order && !finished.current && !isPayable(order.status)) navigate(`orders/${order.orderNumber}`, { replace: true })
  }, [order])

  let content
  if (isLoading) content = <PaymentSkeleton />
  else if (!order) {
    content = isNotFound(error) || !orderNumber
      ? <OrderNotFound orderNumber={orderNumber} />
      : <OrderNotFound orderNumber={orderNumber} error={errorMessage(error)} onRetry={refetch} />
  } else {
    content = (
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] lg:gap-8">
        <Gateway order={order} onFinished={() => { finished.current = true }} />
        <PaymentOrderSummary order={order} />
      </div>
    )
  }

  return (
    <CheckoutShell title="Payment" step={2} width="medium" decorations={false}>
      {content}
    </CheckoutShell>
  )
}

function Gateway({ order, onFinished }: { order: Order; onFinished: () => void }) {
  const dispatch = useAppDispatch()
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

  const refreshOrder = () => dispatch(ordersApi.util.invalidateTags(['Orders', { type: 'Order', id: order.orderNumber }]))

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
      // Keep the processing state on screen long enough to read.
      const [payment] = await Promise.all([payOrder(order.orderNumber, outcome), wait(1600)])
      if (payment.status === 'succeeded') {
        onFinished()
        setPhase('success')
        await wait(900)
        navigate(`order-complete/${order.orderNumber}`)
        refreshOrder()
        return
      }
      setPhase('failed')
      setAttempt((current) => current + 1)
      setFailure(payment.failureReason ?? 'The payment was not completed.')
      refreshOrder()
    } catch (err) {
      setPhase('failed')
      setAttempt((current) => current + 1)
      setFailure(errorMessage(err))
      toast.error('Payment failed', { description: errorMessage(err) })
      refreshOrder()
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    void pay('success')
  }

  const busy = phase === 'processing' || phase === 'success'

  return (
    <section
      aria-labelledby="gateway-title"
      className="relative overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_30px_70px_-35px_rgba(23,63,50,0.55)] dark:border-stone-800 dark:bg-stone-900"
    >
      <span className="gateway-ribbon z-10" aria-hidden>Test mode</span>
      <header className="bg-gradient-to-br from-[#173f32] via-[#1b4a3b] to-[#0f2b22] px-6 pb-6 pt-5 text-white sm:px-8">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-[#fffdf8] shadow-inner">
            <img src={bosscoLogo} alt="" className="size-9 object-contain" />
          </span>
          <div>
            <p className="text-sm font-bold tracking-[0.18em]">BOSSCO</p>
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e9cf9f]"><Lock size={10} aria-hidden /> Secure checkout</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="gateway-title" className="text-sm text-white/70">Amount to pay</h2>
            <p className="mt-1 font-display text-[2.6rem] font-bold leading-none">{formatMoney(order.total)}</p>
          </div>
          <div className="text-right text-xs text-white/70">
            Order
            <b className="mt-0.5 block font-mono text-sm tracking-wide text-white">{order.orderNumber}</b>
          </div>
        </div>
        <p className="sr-only">This is a simulated test-mode payment. No real money is charged.</p>
      </header>

      <form onSubmit={submit} noValidate className="relative px-6 pb-7 pt-6 sm:px-8">
        <div role="tablist" aria-label="Payment method" className="grid grid-cols-2 gap-1 rounded-2xl bg-stone-100 p-1 dark:bg-stone-800">
          {([
            ['card', 'Card', CreditCard],
            ['upi', 'UPI', Smartphone],
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
              className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-[#173f32] ${
                method === key ? 'bg-white text-[#173f32] shadow-sm dark:bg-stone-950 dark:text-amber-200' : 'text-stone-500 hover:text-stone-700 dark:text-stone-400'
              }`}
            >
              <Icon size={16} aria-hidden /> {label}
            </button>
          ))}
        </div>

        {failure && phase !== 'processing' && (
          <div key={attempt} className={`mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 ${attempt ? 'gateway-shake' : ''}`} role="alert">
            <XCircle size={18} className="mt-0.5 flex-none" aria-hidden />
            <div className="min-w-0 flex-1">
              <b className="block font-bold">Payment declined</b>
              <span className="text-rose-700/90 dark:text-rose-300/90">{failure}</span>
              <span className="mt-1 block text-xs text-rose-600/80 dark:text-rose-400/80">Your order is saved — you can try again.</span>
            </div>
            {phase === 'failed' && (
              <button type="button" onClick={() => { setFailure(null); setPhase('idle') }} className="inline-flex flex-none items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-rose-700 shadow-sm ring-1 ring-rose-200 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-200 dark:ring-rose-800">
                <RotateCcw size={12} aria-hidden /> Try again
              </button>
            )}
          </div>
        )}

        <div className="mt-6" role="tabpanel" id={`pay-panel-${method}`} aria-labelledby={`pay-tab-${method}`}>
          {method === 'card'
            ? <CardPaymentForm value={card} errors={cardErrors} onChange={(next) => { setCard(next); setCardErrors({}) }} disabled={busy} />
            : <UpiPaymentForm value={upi} error={upiError} onChange={(next) => { setUpi(next); setUpiError(undefined) }} disabled={busy} />}
        </div>

        <button
          type="submit"
          disabled={busy}
          className="mt-7 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#173f32] px-6 text-base font-bold text-white shadow-[0_16px_32px_-14px_rgba(23,63,50,0.85)] transition hover:bg-[#1e5040] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173f32] disabled:opacity-60 dark:bg-amber-300 dark:text-stone-900 dark:hover:bg-amber-200"
        >
          <Lock size={17} aria-hidden /> Pay {formatMoney(order.total)}
        </button>
        <div className="mt-4 flex flex-col items-center gap-3 text-center">
          <button
            type="button"
            onClick={() => void pay('failure')}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-stone-500 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-rose-500 disabled:opacity-50 dark:text-stone-400 dark:hover:bg-rose-950/40"
          >
            <AlertOctagon size={13} aria-hidden /> Simulate a declined payment
          </button>
          <p className="flex items-center gap-1.5 text-xs text-stone-400">
            <ShieldCheck size={14} aria-hidden /> Encrypted · Razorpay-compatible mock gateway
          </p>
        </div>
      </form>

      {busy && <PaymentProcessing success={phase === 'success'} />}
    </section>
  )
}

function PaymentOrderSummary({ order }: { order: Order }) {
  return (
    <div className="grid gap-5 lg:sticky lg:top-32">
      <Panel as="aside" title="Order summary" subtitle={`${order.itemCount} ${order.itemCount === 1 ? 'item' : 'items'}`}>
        <ul className="grid gap-4 py-1.5">
          {order.items.map((item) => (
            <SummaryLine key={item.id} name={item.productName} variantLabel={item.variantLabel} imageUrl={item.imageUrl} quantity={item.quantity} lineTotal={item.lineTotal} />
          ))}
        </ul>
        <div className="mt-5 border-t border-stone-200 pt-5 dark:border-stone-800">
          <PriceRows subtotal={order.subtotal} discount={order.discount} couponCode={order.couponCode} shippingFee={order.shippingFee} total={order.total} />
        </div>
      </Panel>
      <Panel>
        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">Delivering to</h3>
        <p className="mt-2 text-sm font-bold text-stone-800 dark:text-stone-100">{fullName(order.shippingAddress)}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-stone-500 dark:text-stone-400">{formatAddress(order.shippingAddress)}</p>
        <p className="mt-4 border-t border-stone-200 pt-4 text-xs text-stone-500 dark:border-stone-800 dark:text-stone-400">
          Not ready? Your order is saved —{' '}
          <a href={`#orders/${order.orderNumber}`} className="font-bold text-[#173f32] hover:underline dark:text-amber-200">pay later from your order page</a>.
        </p>
      </Panel>
    </div>
  )
}

function PaymentSkeleton() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] lg:gap-8" role="status" aria-label="Loading payment">
      <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
        <Skeleton className="h-36 rounded-none" />
        <div className="space-y-4 p-8">
          <Skeleton className="h-12 rounded-2xl" />
          <Skeleton className="mx-auto h-48 max-w-[340px] rounded-2xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-14 rounded-2xl" />
        </div>
      </div>
      <Panel>
        <Skeleton className="h-5 w-36" />
        <Skeleton className="mt-5 h-14" />
        <Skeleton className="mt-6 h-24" />
      </Panel>
    </div>
  )
}
