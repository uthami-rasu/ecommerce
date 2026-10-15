import { formatMoney } from '../../utils/format'

type PriceRowsProps = {
  subtotal: number
  discount?: number
  couponCode?: string | null
  /** null = not calculated yet (guest cart). */
  shippingFee?: number | null
  total: number
  itemCount?: number
  totalLabel?: string
}

/** Subtotal / discount / shipping / total definition list. */
export function PriceRows({ subtotal, discount = 0, couponCode, shippingFee, total, itemCount, totalLabel = 'Total' }: PriceRowsProps) {
  return (
    <dl className="space-y-2.5 text-sm">
      <div className="flex justify-between gap-4 text-stone-600 dark:text-stone-300">
        <dt>Subtotal{itemCount !== undefined && <span className="text-stone-400"> ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>}</dt>
        <dd className="font-semibold tabular-nums text-stone-800 dark:text-stone-100">{formatMoney(subtotal)}</dd>
      </div>
      {discount > 0 && (
        <div className="flex justify-between gap-4 text-emerald-700 dark:text-emerald-400">
          <dt>Discount{couponCode && <span className="ml-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold tracking-wide dark:bg-emerald-950/60">{couponCode}</span>}</dt>
          <dd className="font-semibold tabular-nums">−{formatMoney(discount)}</dd>
        </div>
      )}
      {shippingFee !== undefined && (
        <div className="flex justify-between gap-4 text-stone-600 dark:text-stone-300">
          <dt>Shipping</dt>
          <dd className={`font-semibold tabular-nums ${shippingFee === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-800 dark:text-stone-100'}`}>
            {shippingFee === null ? <span className="font-normal text-stone-400">Calculated at checkout</span> : shippingFee === 0 ? 'Free' : formatMoney(shippingFee)}
          </dd>
        </div>
      )}
      <div className="flex items-baseline justify-between gap-4 border-t border-stone-200 pt-3.5 dark:border-stone-700">
        <dt className="text-base font-bold text-[#173f32] dark:text-stone-50">{totalLabel}</dt>
        <dd className="text-xl font-extrabold tabular-nums text-[#173f32] dark:text-stone-50">{formatMoney(total)}</dd>
      </div>
    </dl>
  )
}
