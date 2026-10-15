import { PenLine } from 'lucide-react'
import type { Order } from '../../types/api'
import { formatMoney } from '../../utils/format'
import { Panel } from '../checkout/Panel'
import { ProductThumb } from '../checkout/ProductThumb'

/** Items in the order, linking back to products; delivered orders invite a review. */
export function OrderItemsCard({ order }: { order: Order }) {
  const delivered = order.status === 'delivered'
  return (
    <Panel title="Items" subtitle={`${order.itemCount} ${order.itemCount === 1 ? 'item' : 'items'}`}>
      <ul className="divide-y divide-stone-200/80 dark:divide-stone-800">
        {order.items.map((item) => (
          <li key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
            <a href={`#product/${item.productSlug}`} className="rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173f32]">
              <ProductThumb src={item.imageUrl} alt={item.productName} className="size-16 sm:size-[72px]" />
            </a>
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <a href={`#product/${item.productSlug}`} className="line-clamp-2 text-sm font-bold text-stone-800 hover:underline dark:text-stone-100">{item.productName}</a>
                <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{item.variantLabel} · {item.quantity} × {formatMoney(item.unitPrice)}</p>
                {delivered && (
                  <a href={`#product/${item.productSlug}?review=1`} className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#D9B27C]/15 px-3 py-1 text-xs font-bold text-[#8a6430] transition hover:bg-[#D9B27C]/25 dark:text-amber-200">
                    <PenLine size={12} aria-hidden /> Write a review
                  </a>
                )}
              </div>
              <p className="text-sm font-bold tabular-nums text-stone-800 dark:text-stone-100">{formatMoney(item.lineTotal)}</p>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
