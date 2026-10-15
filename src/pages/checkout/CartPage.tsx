import { useState } from 'react'
import { AlertTriangle, ArrowRight, Lock, LogIn, RefreshCw, ShieldCheck, ShoppingBag } from 'lucide-react'
import { CartLineItem } from '../../components/checkout/CartLineItem'
import { CheckoutShell } from '../../components/checkout/CheckoutShell'
import { CouponForm } from '../../components/checkout/CouponForm'
import { FreeShippingHint } from '../../components/checkout/FreeShippingHint'
import { Panel } from '../../components/checkout/Panel'
import { PriceRows } from '../../components/checkout/PriceRows'
import { ShippingOptions } from '../../components/checkout/ShippingOptions'
import { Skeleton } from '../../components/checkout/Skeleton'
import { loadShippingMethod, saveShippingMethod } from '../../components/checkout/checkoutConstants'
import { useCart } from '../../hooks/useCart'
import { errorMessage } from '../../lib/http/apiClient'
import type { Cart, ShippingMethod } from '../../types/api'
import { formatMoney } from '../../utils/format'
import { loginHref } from '../../utils/router'

const primaryButton =
  'inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#173f32] px-6 text-[15px] font-bold text-white shadow-[0_14px_30px_-14px_rgba(23,63,50,0.8)] transition hover:bg-[#1e5040] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173f32] dark:bg-amber-300 dark:text-stone-900 dark:hover:bg-amber-200'

export function CartPage() {
  const [method, setMethod] = useState<ShippingMethod>(loadShippingMethod)
  const { cart, isGuest, isLoading, isFetching, isMutating, error, refetch, setQuantity, remove } = useCart(method)

  const chooseMethod = (next: ShippingMethod) => {
    setMethod(next)
    saveShippingMethod(next)
  }

  let content
  if (isLoading) content = <CartSkeleton />
  else if (!cart && error) content = <CartError message={errorMessage(error)} onRetry={refetch} />
  else if (!cart || cart.items.length === 0) content = <EmptyCart />
  else {
    const blocked = cart.items.some((line) => !line.available)
    content = (
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)] lg:gap-10">
        <div className="grid gap-6">
          <Panel
            title="Your basket"
            subtitle={`${cart.itemCount} ${cart.itemCount === 1 ? 'item' : 'items'}`}
            action={isFetching && !isMutating ? <span className="text-xs text-stone-400" role="status">Updating…</span> : undefined}
          >
            <ul className="divide-y divide-stone-200/80 dark:divide-stone-800" aria-busy={isMutating}>
              {cart.items.map((line) => (
                <CartLineItem key={line.id} line={line} busy={isMutating} onQuantity={setQuantity} onRemove={remove} />
              ))}
            </ul>
            {blocked && (
              <p className="mt-4 flex items-start gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" role="alert">
                <AlertTriangle size={16} className="mt-0.5 flex-none" aria-hidden />
                Some items are no longer available. Remove them to continue to checkout.
              </p>
            )}
          </Panel>
          {!isGuest && (
            <Panel>
              <CouponForm cart={cart} />
            </Panel>
          )}
        </div>
        <CartSummary cart={cart} isGuest={isGuest} method={method} onMethod={chooseMethod} busy={isFetching} blocked={blocked} />
      </div>
    )
  }

  return (
    <CheckoutShell title="Cart" step={1}>
      {content}
    </CheckoutShell>
  )
}

type CartSummaryProps = {
  cart: Cart
  isGuest: boolean
  method: ShippingMethod
  onMethod: (method: ShippingMethod) => void
  busy: boolean
  blocked: boolean
}

function CartSummary({ cart, isGuest, method, onMethod, busy, blocked }: CartSummaryProps) {
  return (
    <Panel as="aside" title="Cart summary" className="lg:sticky lg:top-32">
      {isGuest ? (
        <>
          <dl className="flex items-baseline justify-between gap-4">
            <dt className="text-base font-bold text-[#173f32] dark:text-stone-50">
              Subtotal <span className="text-sm font-normal text-stone-400">({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})</span>
            </dt>
            <dd className="text-xl font-extrabold tabular-nums text-[#173f32] dark:text-stone-50">{formatMoney(cart.subtotal)}</dd>
          </dl>
          <p className="mt-4 rounded-2xl bg-[#fbf6ec] px-4 py-3 text-[13px] leading-relaxed text-stone-600 dark:bg-stone-800/60 dark:text-stone-300">
            Shipping &amp; coupons are applied at checkout. Sign in and your basket comes with you.
          </p>
          <a href={loginHref('checkout')} className={`${primaryButton} mt-5`}>
            <LogIn size={17} aria-hidden /> Sign in to checkout
          </a>
        </>
      ) : (
        <>
          {cart.shippingOptions.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-2.5 text-xs font-bold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">Shipping</h3>
              <ShippingOptions options={cart.shippingOptions} value={method} onChange={onMethod} />
            </div>
          )}
          {method === 'standard' && <div className="mb-5"><FreeShippingHint cart={cart} /></div>}
          <div aria-busy={busy} className={`transition-opacity ${busy ? 'opacity-60' : ''}`}>
            <PriceRows
              subtotal={cart.subtotal}
              discount={cart.discount}
              couponCode={cart.coupon?.code}
              shippingFee={cart.shippingFee}
              total={cart.total}
              itemCount={cart.itemCount}
            />
          </div>
          {blocked ? (
            <button type="button" disabled className={`${primaryButton} mt-5 cursor-not-allowed opacity-50`}>
              <Lock size={16} aria-hidden /> Checkout
            </button>
          ) : (
            <a href="#checkout" className={`${primaryButton} mt-5`}>
              Checkout <ArrowRight size={17} aria-hidden />
            </a>
          )}
        </>
      )}
      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-stone-400">
        <ShieldCheck size={14} aria-hidden /> Secure checkout · Freshly packed after you order
      </p>
    </Panel>
  )
}

function EmptyCart() {
  return (
    <div className="checkout-fade-in mx-auto grid max-w-xl place-items-center rounded-[2rem] border border-dashed border-stone-300 bg-white/70 px-6 py-16 text-center backdrop-blur dark:border-stone-700 dark:bg-stone-900/60">
      <span className="grid size-16 place-items-center rounded-full bg-[#173f32]/8 text-[#173f32] dark:bg-amber-300/10 dark:text-amber-200">
        <ShoppingBag size={28} aria-hidden />
      </span>
      <h2 className="mt-5 font-display text-3xl font-bold text-[#173f32] dark:text-stone-50">Your cart is waiting</h2>
      <p className="mt-2 max-w-sm text-sm text-stone-500 dark:text-stone-400">Add a small-batch honey or a handful of premium nuts to get started.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <a href="#shop" className="rounded-full bg-[#173f32] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1e5040] dark:bg-amber-300 dark:text-stone-900">Start shopping</a>
        <a href="#honey" className="rounded-full border border-stone-300 px-6 py-3 text-sm font-bold text-stone-700 transition hover:border-stone-400 dark:border-stone-700 dark:text-stone-200">Explore honey</a>
      </div>
    </div>
  )
}

function CartError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-rose-200 bg-rose-50/80 px-6 py-10 text-center dark:border-rose-900 dark:bg-rose-950/30" role="alert">
      <AlertTriangle className="mx-auto text-rose-500" size={28} aria-hidden />
      <h2 className="mt-3 text-lg font-bold text-rose-800 dark:text-rose-200">We couldn’t load your cart</h2>
      <p className="mt-1 text-sm text-rose-700/80 dark:text-rose-300/80">{message}</p>
      <button type="button" onClick={onRetry} className="mt-5 inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700">
        <RefreshCw size={14} aria-hidden /> Try again
      </button>
    </div>
  )
}

function CartSkeleton() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)] lg:gap-10" role="status" aria-label="Loading cart">
      <Panel>
        <Skeleton className="h-5 w-32" />
        {[0, 1, 2].map((key) => (
          <div key={key} className="mt-6 flex items-center gap-4">
            <Skeleton className="size-20 rounded-2xl" />
            <div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/3" /></div>
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
        ))}
      </Panel>
      <Panel>
        <Skeleton className="h-5 w-36" />
        <Skeleton className="mt-5 h-14 rounded-2xl" />
        <Skeleton className="mt-2.5 h-14 rounded-2xl" />
        <Skeleton className="mt-6 h-4" />
        <Skeleton className="mt-3 h-4" />
        <Skeleton className="mt-6 h-12 rounded-2xl" />
      </Panel>
    </div>
  )
}
