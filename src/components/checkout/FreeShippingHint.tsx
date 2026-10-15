import { Gift, Truck } from 'lucide-react'
import type { Cart } from '../../types/api'
import { formatMoney } from '../../utils/format'
import { FREE_SHIPPING_THRESHOLD } from './checkoutConstants'

/** "Add ₹X more for free shipping" progress bar; based on the discounted subtotal like the API. */
export function FreeShippingHint({ cart }: { cart: Cart }) {
  const eligible = cart.subtotal - cart.discount
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - eligible)
  const progress = Math.min(100, Math.round((eligible / FREE_SHIPPING_THRESHOLD) * 100))
  const reached = remaining === 0
  return (
    <div className="rounded-2xl bg-[#fbf6ec] px-4 py-3 dark:bg-stone-800/60">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-stone-700 dark:text-stone-200">
        {reached ? <Gift size={15} className="text-emerald-600" aria-hidden /> : <Truck size={15} className="text-[#b98a4a]" aria-hidden />}
        {reached ? (
          <span>You’ve unlocked <b className="text-emerald-700 dark:text-emerald-400">free standard shipping</b></span>
        ) : (
          <span>Add <b className="text-[#173f32] dark:text-amber-200">{formatMoney(Math.ceil(remaining))}</b> more for free shipping</span>
        )}
      </p>
      <div
        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700"
        role="progressbar"
        aria-label="Progress to free shipping"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div className={`h-full rounded-full transition-[width] duration-700 ${reached ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#D9B27C] to-[#b98a4a]'}`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
