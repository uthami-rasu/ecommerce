import { AlertTriangle, Trash2 } from 'lucide-react'
import type { CartLine } from '../../types/api'
import { formatMoney } from '../../utils/format'
import { ProductThumb } from './ProductThumb'
import { QuantityStepper } from './QuantityStepper'

type CartLineItemProps = {
  line: CartLine
  busy: boolean
  onQuantity: (line: CartLine, quantity: number) => void
  onRemove: (line: CartLine) => void
}

/** One cart row: image, name + variant, stock warnings, stepper, price. */
export function CartLineItem({ line, busy, onQuantity, onRemove }: CartLineItemProps) {
  const hasCompare = line.compareAtPrice !== null && line.compareAtPrice > line.unitPrice
  const max = Math.max(1, line.maxQuantity)
  return (
    <li className={`grid grid-cols-[72px_1fr_auto] items-start gap-x-4 gap-y-3 py-5 sm:grid-cols-[88px_1fr_auto_120px] sm:items-center ${line.available ? '' : 'opacity-90'}`}>
      <a href={`#product/${line.slug}`} className="row-span-2 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173f32] sm:row-span-1">
        <ProductThumb src={line.imageUrl} alt={line.name} className={`size-[72px] sm:size-[88px] ${line.available ? '' : 'grayscale'}`} />
      </a>
      <div className="min-w-0">
        <a href={`#product/${line.slug}`} className="line-clamp-2 text-[15px] font-bold leading-snug text-[#173f32] hover:underline dark:text-stone-50">
          {line.name}
        </a>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          {line.variantLabel} · {formatMoney(line.unitPrice)} each
        </p>
        {line.issue && (
          <p className={`mt-2 inline-flex items-start gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold ${line.available ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'}`} role="status">
            <AlertTriangle size={13} className="mt-px flex-none" aria-hidden />
            {line.issue}
          </p>
        )}
        <button
          type="button"
          onClick={() => onRemove(line)}
          disabled={busy}
          className="mt-2 hidden items-center gap-1.5 rounded text-xs font-semibold text-stone-500 transition hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-[#173f32] disabled:opacity-50 sm:inline-flex dark:text-stone-400"
        >
          <Trash2 size={13} aria-hidden /> Remove
        </button>
      </div>
      <div className="col-start-2 flex items-center gap-3 sm:col-start-auto">
        <QuantityStepper value={line.quantity} max={max} disabled={busy || !line.available} onChange={(quantity) => onQuantity(line, quantity)} label={line.name} />
        <button
          type="button"
          onClick={() => onRemove(line)}
          disabled={busy}
          aria-label={`Remove ${line.name}`}
          className="grid size-9 place-items-center rounded-full text-stone-400 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-[#173f32] sm:hidden dark:hover:bg-rose-950/40"
        >
          <Trash2 size={15} />
        </button>
      </div>
      <div className="col-start-3 row-start-1 text-right sm:col-start-auto sm:row-start-auto">
        <p className="text-[15px] font-bold tabular-nums text-[#2f5d3a] dark:text-emerald-300">{formatMoney(line.lineTotal)}</p>
        {hasCompare && (
          <p className="text-xs tabular-nums text-stone-400 line-through">
            <span className="sr-only">Was </span>
            {formatMoney((line.compareAtPrice ?? 0) * line.quantity)}
          </p>
        )}
      </div>
    </li>
  )
}
