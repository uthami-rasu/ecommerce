import { Check, Heart, Loader2, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ProductSummary } from '../../types/api'
import { ProductImage } from '../catalog/ProductImage'
import { ProductRating } from './ProductRating'

type ProductCardProps = {
  product: ProductSummary
  index?: number
  wished: boolean
  adding: boolean
  onWish: () => void
  /** Resolves true when the product landed in the cart. */
  onAdd: () => Promise<boolean>
}

const amount = (value: number) => value.toLocaleString('en-IN', { maximumFractionDigits: 2 })

export function ProductCard({ product, index = 0, wished, adding, onWish, onAdd }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false)
  const href = `#product/${product.slug}`

  useEffect(() => {
    if (!isAdded) return
    const timer = window.setTimeout(() => setIsAdded(false), 1600)
    return () => window.clearTimeout(timer)
  }, [isAdded])

  const add = async () => {
    if (await onAdd()) setIsAdded(true)
  }

  return (
    <article className="product-card group relative mx-auto flex w-full flex-col p-2.5" data-reveal style={{ transitionDelay: `${index * 45}ms` }}>
      <div className="product-card-frame relative aspect-[4/3.9] overflow-hidden">
        <a className="block size-full" href={href} tabIndex={-1} aria-hidden="true">
          <ProductImage
            className="size-full object-cover transition duration-[900ms] ease-out group-hover:scale-[1.07]"
            image={product.image}
            alt={product.name}
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
          />
        </a>
        <span className="product-card-sheen" aria-hidden="true" />
        {product.badge ? <span className="product-badge">{product.badge}</span> : null}
        {!product.inStock && <span className="catalog-soldout">Sold out</span>}
        <button
          className={`product-fav ${wished ? 'is-liked' : ''}`}
          onClick={onWish}
          type="button"
          aria-pressed={wished}
          aria-label={`${wished ? 'Remove' : 'Add'} ${product.name} ${wished ? 'from' : 'to'} wishlist`}
        >
          <Heart size={15} fill={wished ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-2.5 pt-4 text-left">
        <div className="flex items-center justify-between gap-3">
          <ProductRating rating={product.rating} reviews={product.reviewCount} />
          <span className="truncate text-[9px] font-bold uppercase tracking-[.16em] text-stone-400">{product.sizes[0]}{product.sizes.length > 1 ? ` +${product.sizes.length - 1}` : ''}</span>
        </div>

        <h3 className="mt-2.5 font-display text-[17px] font-bold leading-[1.12] tracking-[-.015em] text-[#173f32] dark:text-stone-50">
          <a className="transition-colors hover:text-[#a8682f] focus-visible:outline-none focus-visible:underline" href={href}>{product.name}</a>
        </h3>

        <div className="mt-auto">
          <span className="product-card-rule" />
          <div className="flex items-end justify-between gap-3">
            <p className="product-price">
              <span>₹</span>{amount(product.price)}
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <s className="ml-1.5 text-[10px] font-medium text-stone-400" aria-label={`was ₹${amount(product.compareAtPrice)}`}>₹{amount(product.compareAtPrice)}</s>
              )}
            </p>
            <button
              className={`product-add ${isAdded ? 'is-added' : ''} disabled:cursor-not-allowed disabled:opacity-60`}
              type="button"
              onClick={add}
              disabled={adding || !product.inStock}
              aria-busy={adding}
              aria-label={product.inStock ? `Add ${product.name} to cart` : `${product.name} is sold out`}
            >
              {adding ? <Loader2 className="animate-spin" size={14} /> : isAdded ? <Check size={14} strokeWidth={2.6} /> : <Plus size={14} strokeWidth={2.6} />}
              {!product.inStock ? 'Sold out' : isAdded ? 'Added' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
