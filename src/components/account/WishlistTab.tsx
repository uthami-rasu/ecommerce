import { useState } from 'react'
import { Heart, ShoppingBag, Star, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAppDispatch } from '../../app/hooks'
import { Spinner } from '../auth/FormBits'
import { catalogApi } from '../../features/catalog/catalogApi'
import { useCart } from '../../hooks/useCart'
import { useWishlist } from '../../hooks/useWishlist'
import { errorMessage } from '../../lib/http/apiClient'
import type { ProductSummary } from '../../types/api'
import { formatMoney } from '../../utils/format'
import { AccountSection, EmptyState } from './AccountSection'

/** The wishlist only knows the default variant id; fetch the product to get its label and live price. */
function useAddDefaultVariant() {
  const dispatch = useAppDispatch()
  const { add } = useCart()
  const [adding, setAdding] = useState<string | null>(null)

  const addToCart = async (product: ProductSummary) => {
    setAdding(product.id)
    const request = dispatch(catalogApi.endpoints.getProduct.initiate(product.slug))
    try {
      const detail = await request.unwrap()
      const variant =
        detail.variants.find((item) => item.id === product.defaultVariantId && item.inStock) ??
        detail.variants.find((item) => item.inStock)
      if (!variant) {
        toast.error('Out of stock', { description: `${product.name} is not available right now.` })
        return
      }
      await add({ product, variant })
    } catch (error) {
      toast.error('Could not add to cart', { description: errorMessage(error) })
    } finally {
      request.unsubscribe()
      setAdding(null)
    }
  }

  return { addToCart, adding }
}

export function WishlistTab() {
  const { items, isLoading, toggle } = useWishlist()
  const { addToCart, adding } = useAddDefaultVariant()

  return (
    <AccountSection
      title="Wishlist"
      description={items.length ? `${items.length} saved ${items.length === 1 ? 'treat' : 'treats'} waiting for you.` : 'Tap the heart on any product to save it here.'}
      actions={items.length > 0 && <a href="#wishlist" className="text-sm font-semibold text-[#aa753a] underline-offset-4 hover:text-[#173f32] hover:underline dark:text-[#e4c08d]">Open full wishlist</a>}
    >
      {isLoading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Loading wishlist">
          {[0, 1, 2].map((key) => <div key={key} className="h-24 animate-pulse rounded-2xl bg-stone-100/80 dark:bg-stone-800/50" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Heart} title="Your wishlist is empty" action={<a href="#shop" className="inline-flex h-11 items-center gap-2 rounded-full bg-[#173f32] px-6 text-sm font-bold text-white transition hover:bg-[#1e5040] dark:bg-[#D9B27C] dark:text-stone-950"><ShoppingBag size={16} /> Explore the shop</a>}>
          Save the nuts, dry fruits and honey you love and find them here later.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-stone-100 dark:divide-stone-800">
          {items.map((product) => {
            const image = product.image?.thumbUrl ?? product.image?.url
            const busy = adding === product.id
            return (
              <li key={product.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <a href={`#product/${product.slug}`} className="shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-[#fbf8f2] dark:border-stone-800 dark:bg-stone-800">
                  {image ? (
                    <img src={image} alt={product.image?.alt ?? product.name} className="size-20 object-cover transition duration-500 hover:scale-105 sm:size-24" loading="lazy" />
                  ) : (
                    <span className="grid size-20 place-items-center text-stone-300 sm:size-24"><ShoppingBag size={22} /></span>
                  )}
                </a>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#aa753a] dark:text-[#e4c08d]">{product.category.name}</p>
                  <a href={`#product/${product.slug}`} className="mt-0.5 block truncate font-semibold text-stone-900 hover:text-[#173f32] hover:underline dark:text-stone-100 dark:hover:text-amber-100">{product.name}</a>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="font-bold text-stone-900 dark:text-stone-50">{formatMoney(product.price)}</span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-xs text-stone-400 line-through">{formatMoney(product.compareAtPrice)}</span>
                    )}
                    {product.rating > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-stone-500"><Star size={12} className="fill-amber-400 text-amber-400" /> {product.rating.toFixed(1)}</span>
                    )}
                    {!product.inStock && <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-500 dark:bg-stone-800">Out of stock</span>}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    disabled={!product.inStock || busy}
                    onClick={() => addToCart(product)}
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-[#D9B27C] px-3.5 text-[13px] font-bold text-stone-950 shadow-sm transition hover:bg-[#c9a068] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D9B27C]/40 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500 sm:px-5 dark:disabled:bg-stone-800"
                    aria-label={`Add ${product.name} to cart`}
                  >
                    {busy ? <Spinner /> : <ShoppingBag size={15} />}
                    <span className="hidden sm:inline">{product.inStock ? 'Add to cart' : 'Sold out'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(product)}
                    className="grid size-10 place-items-center rounded-full text-stone-400 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200 dark:hover:bg-rose-950/40"
                    aria-label={`Remove ${product.name} from wishlist`}
                  >
                    <X size={17} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </AccountSection>
  )
}
