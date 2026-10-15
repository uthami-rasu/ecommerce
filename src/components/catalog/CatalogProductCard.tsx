import { Ban, Heart, Loader2, MapPin, ShoppingBag } from 'lucide-react'
import type { ReactNode } from 'react'
import type { ProductSummary } from '../../types/api'
import { badgeClassOf } from './catalogFormat'
import { PriceTag } from './PriceTag'
import { ProductImage } from './ProductImage'
import { RatingStars } from './RatingStars'

export type ViewMode = 'grid' | 'list'

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="catalog-tooltip group/tip relative inline-grid">
      {children}
      <span className="pointer-events-none absolute bottom-[calc(100%+.55rem)] left-1/2 z-30 w-max max-w-48 -translate-x-1/2 rounded-lg bg-[#173f32] px-2.5 py-1.5 text-center text-[10px] font-medium text-white opacity-0 shadow-xl transition duration-200 group-hover/tip:translate-y-[-2px] group-hover/tip:opacity-100 group-focus-within/tip:opacity-100" role="tooltip">{label}</span>
    </span>
  )
}

type CatalogProductCardProps = {
  product: ProductSummary
  view: ViewMode
  wished: boolean
  adding: boolean
  onWish: () => void
  onAdd: () => void
}

/** Shop / category listing card (grid or list layout). */
export function CatalogProductCard({ product, view, wished, adding, onWish, onAdd }: CatalogProductCardProps) {
  const href = `#product/${product.slug}`
  return (
    <article className={`honey-product-card group ${view === 'list' ? 'honey-product-list' : ''}`}>
      <div className="honey-product-media">
        {product.badge && <span className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.1em] ${badgeClassOf(product.badge)}`}>{product.badge}</span>}
        <Tooltip label={wished ? 'Remove from wishlist' : 'Save to wishlist'}>
          <button className={`product-wish ${wished ? 'is-wished' : ''}`} type="button" onClick={onWish} aria-pressed={wished} aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}>
            <Heart size={16} fill={wished ? 'currentColor' : 'none'} />
          </button>
        </Tooltip>
        <a className="block h-full" href={href} aria-label={`View ${product.name}`} tabIndex={-1}>
          <ProductImage image={product.image} alt={product.name} sizes={view === 'list' ? '(min-width: 640px) 320px, 100vw' : '(min-width: 1180px) 22vw, (min-width: 640px) 45vw, 100vw'} />
        </a>
        {product.origin && <span className="product-origin"><MapPin size={11} /> {product.origin}</span>}
        {!product.inStock && <span className="catalog-soldout">Sold out</span>}
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <RatingStars rating={product.rating} count={product.reviewCount} />
          <span className="truncate text-[10px] font-medium text-stone-400">{product.sizes.join(' · ')}</span>
        </div>
        <h3 className="mt-2 font-display text-[1.35rem] font-bold leading-tight text-[#1d3028] transition-colors group-hover:text-[#9b6426] dark:text-stone-100 dark:group-hover:text-[#e7bd78]"><a href={href}>{product.name}</a></h3>
        {product.subtitle && <p className="mt-2 line-clamp-2 text-[11px] leading-[1.65] text-stone-500 dark:text-stone-400">{product.subtitle}</p>}
        <div className="mt-auto pt-4">
          <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="product-add justify-center disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={onAdd} disabled={adding || !product.inStock} aria-busy={adding}>
            {adding ? <Loader2 className="animate-spin" size={13} /> : product.inStock ? <ShoppingBag size={13} /> : <Ban size={13} />}
            {product.inStock ? (adding ? 'Adding…' : 'Add to cart') : 'Sold out'}
          </button>
          <a className="product-details" href={href}>View details</a>
        </div>
      </div>
    </article>
  )
}
