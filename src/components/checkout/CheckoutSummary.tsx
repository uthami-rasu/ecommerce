import { Loader2, Lock, ShieldCheck } from 'lucide-react'
import type { Cart } from '../../types/api'
import { formatMoney } from '../../utils/format'
import { CouponForm } from './CouponForm'
import { Panel } from './Panel'
import { PriceRows } from './PriceRows'
import { SummaryLine } from './SummaryLine'

type CheckoutSummaryProps = {
  cart: Cart
  busy: boolean
  submitting: boolean
  blocked: boolean
}

/** Sticky order summary on the checkout page with coupon box, server totals and the place-order button. */
export function CheckoutSummary({ cart, busy, submitting, blocked }: CheckoutSummaryProps) {
  return (
    <Panel as="aside" title="Order summary" subtitle={`${cart.itemCount} ${cart.itemCount === 1 ? 'item' : 'items'}`} className="lg:sticky lg:top-32"
      action={<a href="#cart" className="rounded text-xs font-bold text-[#173f32] underline-offset-4 hover:underline dark:text-amber-200">Edit cart</a>}
    >
      <ul className="grid max-h-[320px] gap-4 overflow-y-auto py-1.5 pr-1" data-lenis-prevent>
        {cart.items.map((line) => (
          <SummaryLine key={line.id} name={line.name} variantLabel={line.variantLabel} imageUrl={line.imageUrl} quantity={line.quantity} lineTotal={line.lineTotal} />
        ))}
      </ul>
      <div className="my-5 border-t border-stone-200 pt-5 dark:border-stone-800">
        <CouponForm cart={cart} compact />
      </div>
      <div aria-busy={busy} className={`transition-opacity ${busy ? 'opacity-60' : ''}`}>
        <PriceRows subtotal={cart.subtotal} discount={cart.discount} couponCode={cart.coupon?.code} shippingFee={cart.shippingFee} total={cart.total} />
      </div>
      <button
        type="submit"
        disabled={submitting || blocked || busy}
        className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#173f32] px-6 text-[15px] font-bold text-white shadow-[0_14px_30px_-14px_rgba(23,63,50,0.8)] transition hover:bg-[#1e5040] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173f32] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-amber-300 dark:text-stone-900 dark:hover:bg-amber-200"
      >
        {submitting ? <Loader2 size={17} className="animate-spin" aria-hidden /> : <Lock size={16} aria-hidden />}
        {submitting ? 'Placing order…' : `Place order · ${formatMoney(cart.total)}`}
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-stone-400">
        <ShieldCheck size={14} aria-hidden /> You’ll pay securely on the next step
      </p>
    </Panel>
  )
}
