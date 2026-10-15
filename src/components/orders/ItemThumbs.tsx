import { ProductThumb } from '../checkout/ProductThumb'
import type { OrderItem } from '../../types/api'

/** Overlapping thumbnails for an order's items: first few, then "+N". */
export function ItemThumbs({ items, max = 4 }: { items: OrderItem[]; max?: number }) {
  const shown = items.slice(0, max)
  const extra = items.length - shown.length
  return (
    <div className="flex -space-x-3">
      {shown.map((item) => (
        <span key={item.id} className="rounded-2xl ring-[3px] ring-white dark:ring-stone-900" title={`${item.quantity} × ${item.productName} (${item.variantLabel})`}>
          <ProductThumb src={item.imageUrl} alt={item.productName} className="size-12" />
        </span>
      ))}
      {extra > 0 && (
        <span className="grid size-12 place-items-center rounded-2xl bg-stone-100 text-xs font-bold text-stone-600 ring-[3px] ring-white dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-900">
          +{extra}
        </span>
      )}
    </div>
  )
}
