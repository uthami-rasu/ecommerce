import { formatMoney } from '../../utils/format'
import { discountOf } from './catalogFormat'

type PriceTagProps = {
  price: number
  compareAtPrice?: number | null
  size?: 'sm' | 'md' | 'lg'
  /** Show the "x% off" chip next to a struck-through compare-at price. */
  showDiscount?: boolean
  className?: string
}

const SIZES = {
  sm: 'text-sm',
  md: 'text-xl',
  lg: 'text-[1.9rem]',
}

export function PriceTag({ price, compareAtPrice, size = 'md', showDiscount = true, className = '' }: PriceTagProps) {
  const discount = discountOf(price, compareAtPrice)
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className}`}>
      <strong className={`${SIZES[size]} font-semibold tabular-nums text-[#4f7f46] dark:text-[#a8d49a]`}>{formatMoney(price)}</strong>
      {discount > 0 && (
        <>
          <s className="text-[11px] text-stone-400 dark:text-stone-500" aria-label={`Was ${formatMoney(compareAtPrice!)}`}>{formatMoney(compareAtPrice!)}</s>
          {showDiscount && <span className="text-[9px] font-bold uppercase tracking-wide text-[#b94738] dark:text-[#f19a8c]">{discount}% off</span>}
        </>
      )}
    </span>
  )
}
