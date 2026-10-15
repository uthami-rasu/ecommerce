import { formatMoney } from '../../utils/format'
import { ProductThumb } from './ProductThumb'

type SummaryLineProps = {
  name: string
  variantLabel: string
  imageUrl: string | null
  quantity: number
  lineTotal: number
  href?: string
}

/** Compact line for order summaries: thumbnail with quantity badge, name, variant, total. */
export function SummaryLine({ name, variantLabel, imageUrl, quantity, lineTotal, href }: SummaryLineProps) {
  const title = href ? (
    <a href={href} className="hover:underline">{name}</a>
  ) : (
    name
  )
  return (
    <li className="flex items-center gap-3.5">
      <span className="relative">
        <ProductThumb src={imageUrl} alt={name} className="size-14" />
        <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-stone-800 text-[10px] font-bold text-white ring-2 ring-white dark:bg-amber-300 dark:text-stone-900 dark:ring-stone-900">
          {quantity}
          <span className="sr-only"> ×</span>
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-[13px] font-bold leading-snug text-stone-800 dark:text-stone-100">{title}</span>
        <span className="mt-0.5 block text-xs text-stone-500 dark:text-stone-400">{variantLabel}</span>
      </span>
      <span className="text-[13px] font-bold tabular-nums text-stone-800 dark:text-stone-100">{formatMoney(lineTotal)}</span>
    </li>
  )
}
