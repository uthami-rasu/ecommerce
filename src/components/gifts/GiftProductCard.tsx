import { Heart, Loader2 } from 'lucide-react'
import type { ProductSummary } from '../../types/api'
import { formatMoney } from '../../utils/format'
import { badgeClassOf } from '../catalog/catalogFormat'
import { ProductImage } from '../catalog/ProductImage'
import { Stars } from '../catalog/RatingStars'

type GiftProductCardProps = {
  product: ProductSummary
  wished: boolean
  busy: boolean
  onWish: () => void
  onAdd: () => void
  onBuy: () => void
}

/** Return-gift listing card: add to cart, or buy now (straight to checkout). */
export function GiftProductCard({ product, wished, busy, onWish, onAdd, onBuy }: GiftProductCardProps) {
  const href = `#product/${product.slug}`
  const soldOut = !product.inStock
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_-18px_rgba(23,63,50,0.35)] ring-1 ring-stone-200/70 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgba(23,63,50,0.45)] dark:bg-stone-900 dark:ring-stone-800">
      <div className="relative bg-[#f6f1e8] p-4 dark:bg-stone-800/60">
        {product.badge && (
          <span className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.1em] ${badgeClassOf(product.badge)}`}>
            {product.badge}
          </span>
        )}
        <button
          type="button"
          onClick={onWish}
          aria-pressed={wished}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className={`absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full bg-white/95 shadow-sm transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-[#173f32] ${wished ? 'text-rose-500' : 'text-stone-500'}`}
        >
          <Heart size={15} fill={wished ? 'currentColor' : 'none'} />
        </button>
        <a href={href} tabIndex={-1} aria-hidden className="mx-auto block aspect-square w-full max-w-[220px] overflow-hidden rounded-xl">
          <ProductImage image={product.image} alt={product.name} sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw" />
        </a>
        {soldOut && <span className="absolute inset-x-0 bottom-3 mx-auto w-max rounded-full bg-stone-900/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Sold out</span>}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
          <Stars rating={product.rating} size={11} />
          <span>({product.reviewCount})</span>
        </div>
        <h3 className="mt-2 font-display text-[1.2rem] font-bold leading-tight text-[#b9773a] dark:text-[#e7bd78]">
          <a href={href} className="hover:underline">{product.name}</a>
        </h3>
        {product.subtitle && <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">{product.subtitle}</p>}

        <div className="mt-auto flex items-baseline justify-between gap-2 pt-3">
          <span className="flex items-baseline gap-1.5">
            <strong className="text-lg font-bold tabular-nums text-[#b9773a] dark:text-[#e7bd78]">{formatMoney(product.price)}</strong>
            {product.discountPercent > 0 && product.compareAtPrice !== null && (
              <s className="text-[11px] text-stone-400">{formatMoney(product.compareAtPrice)}</s>
            )}
          </span>
          {product.discountPercent > 0 && <span className="text-[10px] font-bold text-emerald-600">{product.discountPercent}% OFF</span>}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onAdd}
            disabled={busy || soldOut}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-[#d4a373] text-[10px] font-bold uppercase tracking-wider text-[#b9773a] transition hover:bg-[#fbf3e6] disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-stone-800"
          >
            Add to cart
          </button>
          <button
            type="button"
            onClick={onBuy}
            disabled={busy || soldOut}
            aria-busy={busy}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#d4a373] text-[10px] font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#c08f5e] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy && <Loader2 size={12} className="animate-spin" />} Buy now
          </button>
        </div>
      </div>
    </article>
  )
}

export function GiftProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200/70 dark:bg-stone-900 dark:ring-stone-800" aria-hidden>
      <div className="aspect-square animate-pulse bg-stone-100 dark:bg-stone-800" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-16 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
        <div className="h-9 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
      </div>
    </div>
  )
}
