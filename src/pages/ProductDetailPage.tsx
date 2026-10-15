import { useEffect, useState, type KeyboardEvent } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, ArrowLeft, Check, Heart, Loader2, PackageCheck, Share2, ShoppingBag, Truck } from 'lucide-react'
import { Footer } from '../components/layout/Footer'
import { discountOf } from '../components/catalog/catalogFormat'
import { findCategory, themeOf } from '../components/catalog/categoryTree'
import { RatingStars } from '../components/catalog/RatingStars'
import { defaultVariantOf } from '../components/catalog/useQuickAdd'
import { ProductGallery } from '../components/product/ProductGallery'
import { ProductDetailSkeleton, ProductLoadError, ProductNotFound } from '../components/product/ProductDetailStates'
import { QuantityStepper } from '../components/product/QuantityStepper'
import { ReviewsPanel } from '../components/product/ReviewsPanel'
import { SimilarProducts } from '../components/product/SimilarProducts'
import { VariantSelector } from '../components/product/VariantSelector'
import { useGetCategoriesQuery, useGetProductQuery } from '../features/catalog/catalogApi'
import { useCart } from '../hooks/useCart'
import { useRoute } from '../hooks/useRoute'
import { useWishlist } from '../hooks/useWishlist'
import { errorMessage, isApiError } from '../lib/http/apiClient'
import type { ProductDetail } from '../types/api'
import { formatMoney } from '../utils/format'
import '../styles/catalog.css'

const FREE_DELIVERY_OVER = 999
const MAX_QUANTITY = 20

type Tab = 'description' | 'reviews'

const CARE_NOTES = {
  honey: [
    'Natural honey may crystallise over time; stand the jar in warm water to liquefy.',
    'Store sealed in a cool, dry place away from direct sunlight.',
    'Not suitable for infants under 12 months of age.',
  ],
  'dry-fruits': [
    'Store in an airtight container in a cool, dry place once opened.',
    'Refrigerate in humid weather to keep every bite crunchy.',
    'Packed in facilities that also handle nuts, sesame and dairy.',
  ],
  all: ['Store in a cool, dry place away from direct sunlight.'],
} as const

const paragraphsOf = (text: string | null) => (text ?? '').split(/\n{2,}|\r?\n/).map((part) => part.trim()).filter(Boolean)

async function shareProduct(product: ProductDetail) {
  const url = window.location.href.split('?')[0]
  const data = { title: product.name, text: product.subtitle ?? `${product.name} from Bossco`, url }
  if (navigator.share) {
    try {
      await navigator.share(data)
      return
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    toast.success('Link copied', { description: 'Share it with someone who loves good food.' })
  } catch {
    toast.error('Could not copy the link', { description: url })
  }
}

export function ProductDetailPage({ slug }: { slug: string }) {
  const route = useRoute()
  const wantsReview = route.query.get('review') === '1'
  const { data: product, error, isError, refetch } = useGetProductQuery(slug)

  let content
  // Keyed on the review intent: a suspended navigation can bring back a hidden, still-mounted
  // view with its old tab state, so `?review=1` must always start a fresh view.
  if (product) content = <ProductView key={wantsReview ? 'review' : 'view'} product={product} wantsReview={wantsReview} />
  else if (isError && isApiError(error) && error.status === 404) content = <ProductNotFound />
  else if (isError) content = <ProductLoadError message={errorMessage(error)} onRetry={() => refetch()} />
  else content = <ProductDetailSkeleton />

  return (
    <main className="product-detail-page" id="product-detail">
      {content}
      <Footer />
    </main>
  )
}

function ProductView({ product, wantsReview }: { product: ProductDetail; wantsReview: boolean }) {
  const { data: tree } = useGetCategoriesQuery()
  const { add, cart } = useCart()
  const { isWished, toggle } = useWishlist()
  const [variantId, setVariantId] = useState(() => defaultVariantOf(product)?.id ?? product.variants[0]?.id)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [tab, setTab] = useState<Tab>(wantsReview ? 'reviews' : 'description')
  const [reviewRequest, setReviewRequest] = useState(wantsReview)

  // `?review=1` arriving while the page is open (e.g. from an order) opens the reviews tab.
  if (wantsReview !== reviewRequest) {
    setReviewRequest(wantsReview)
    if (wantsReview) setTab('reviews')
  }

  useEffect(() => {
    const previous = document.title
    document.title = `${product.name} · Bossco`
    return () => { document.title = previous }
  }, [product.name])

  const variant = product.variants.find((item) => item.id === variantId)
  const price = variant?.price ?? product.price
  const compareAtPrice = variant ? variant.compareAtPrice : product.compareAtPrice
  const discount = discountOf(price, compareAtPrice)
  const available = variant ? variant.inStock : product.inStock
  const wished = isWished(product.id)
  const match = findCategory(tree, product.category.slug)
  const theme = match ? themeOf(match) : /honey|comb|gift/.test(product.category.slug) ? 'honey' : 'dry-fruits'
  const root = match?.parent ?? match?.category ?? product.category
  const gallery = product.images.length ? product.images : product.image ? [product.image] : []
  const description = paragraphsOf(product.description)
  const subtotal = cart?.subtotal ?? 0
  const remainingForFree = Math.max(0, FREE_DELIVERY_OVER - subtotal)

  const addToCart = async () => {
    if (!variant || !variant.inStock) return
    setAdding(true)
    await add({ product, variant, quantity })
    setAdding(false)
  }

  const onTabKey = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    const next: Tab = tab === 'description' ? 'reviews' : 'description'
    setTab(next)
    document.getElementById(`tab-${next}`)?.focus()
  }

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-20 pt-8 sm:px-8 lg:px-12 lg:pt-12">
      <a className="product-back" href={`#shop/${product.category.slug}`}><ArrowLeft size={16} /> Back to {product.category.name.toLowerCase()}</a>
      <nav className="product-breadcrumb" aria-label="Breadcrumb">
        <a href="#home">Home</a><span aria-hidden="true">/</span>
        <a href="#shop">Shop</a><span aria-hidden="true">/</span>
        {match?.parent && <><a href={`#shop/${match.parent.slug}`}>{match.parent.name}</a><span aria-hidden="true">/</span></>}
        <a href={`#shop/${product.category.slug}`}>{product.category.name}</a><span aria-hidden="true">/</span>
        <b aria-current="page">{product.name}</b>
      </nav>

      <section className="product-detail-top">
        <ProductGallery images={gallery} name={product.name} wished={wished} onWish={() => toggle(product)} />

        <div className="product-purchase-panel">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="product-overline">{product.category.name}{product.badge ? <span className="pdp-badge">{product.badge}</span> : null}</span>
              <h1>{product.name}</h1>
              {product.subtitle && <p>{product.subtitle}</p>}
            </div>
            <div className="flex shrink-0 gap-1">
              <button className={`detail-icon-button ${wished ? 'is-active' : ''}`} type="button" onClick={() => toggle(product)} aria-pressed={wished} aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}><Heart size={15} fill={wished ? 'currentColor' : 'none'} /></button>
              <button className="detail-icon-button" type="button" onClick={() => shareProduct(product)} aria-label="Share this product"><Share2 size={15} /></button>
            </div>
          </div>

          <div className="product-price-row">
            <div><strong>{formatMoney(price)}</strong>{discount > 0 && <small aria-label={`Was ${formatMoney(compareAtPrice!)}`}>{formatMoney(compareAtPrice!)}</small>}</div>
            {discount > 0 && <span>Save {discount}%</span>}
            <button className="detail-rating" type="button" onClick={() => { setTab('reviews'); document.getElementById('product-information')?.scrollIntoView({ behavior: 'smooth' }) }}>
              <RatingStars rating={product.rating} count={product.reviewCount} />
            </button>
          </div>

          <dl className="product-meta">
            <div><dt>SKU</dt><dd className="text-[11px]">{variant ? variant.sku.split('-').map((part, index) => <span key={index}>{index > 0 && <>-<wbr /></>}{part}</span>) : '—'}</dd></div>
            <div><dt>Category</dt><dd><a href={`#shop/${product.category.slug}`}>{product.category.name}</a></dd></div>
            <div><dt>Availability</dt><dd className={available ? (variant?.lowStock ? 'text-[#b2741c]' : 'text-[#4f7f46]') : 'text-[#b94738]'}>{available ? (variant?.lowStock ? 'Low stock' : 'In stock') : 'Out of stock'}</dd></div>
          </dl>

          {product.variants.length > 0 && (
            <VariantSelector variants={product.variants} selectedId={variantId} onSelect={(next) => setVariantId(next.id)} legend={theme === 'honey' ? 'Jar size' : 'Pack size'} />
          )}
          {variant?.inStock && variant.lowStock && <p className="pdp-low-stock"><AlertTriangle size={13} /> Only a few left in {variant.label} — order soon.</p>}

          <div className="product-buy-row">
            <QuantityStepper value={quantity} onChange={setQuantity} max={MAX_QUANTITY} disabled={!available} />
            <button className="detail-add-cart" type="button" onClick={addToCart} disabled={!available || adding} aria-busy={adding}>
              {adding ? <><Loader2 className="animate-spin" size={15} /> Adding…</> : available ? <><ShoppingBag size={15} /> Add to cart · {formatMoney(price * quantity)}</> : 'Out of stock'}
            </button>
          </div>

          <div className="product-service-list">
            <div>
              <Truck size={19} />
              <span>
                <b>{remainingForFree > 0 ? 'Free delivery over ₹999' : 'Your order ships free'}</b>
                <small>{remainingForFree > 0 && subtotal > 0 ? `Add ${formatMoney(remainingForFree)} more to your cart for free delivery.` : remainingForFree > 0 ? 'Standard and express delivery across India — choose at checkout.' : 'Your cart already qualifies for free standard delivery.'}</small>
              </span>
            </div>
            <div><PackageCheck size={19} /><span><b>Freshly packed after you order</b><small>Sealed for freshness{product.origin ? ` · Sourced from ${product.origin}` : ''}</small></span></div>
          </div>
        </div>
      </section>

      <section className="product-information" id="product-information">
        <div className="product-tabs" role="tablist" aria-label="Product information" onKeyDown={onTabKey}>
          <button id="tab-description" role="tab" aria-selected={tab === 'description'} aria-controls="panel-description" tabIndex={tab === 'description' ? 0 : -1} className={tab === 'description' ? 'is-active' : ''} type="button" onClick={() => setTab('description')}>Description</button>
          <button id="tab-reviews" role="tab" aria-selected={tab === 'reviews'} aria-controls="panel-reviews" tabIndex={tab === 'reviews' ? 0 : -1} className={tab === 'reviews' ? 'is-active' : ''} type="button" onClick={() => setTab('reviews')}>Reviews ({product.reviewCount})</button>
        </div>
        {tab === 'description' ? (
          <div className="product-copy" id="panel-description" role="tabpanel" aria-labelledby="tab-description">
            <h2>Product Description</h2>
            {description.length ? description.map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p>{product.subtitle ?? 'Details for this product are coming soon.'}</p>}
            <h3>At a glance</h3>
            <ul>
              {product.origin && <li><Check size={14} />Origin: {product.origin}</li>}
              <li><Check size={14} />Category: {product.category.name}</li>
              {product.variants.length > 0 && <li><Check size={14} />Available in {product.variants.map((item) => item.label).join(', ')}</li>}
              <li><Check size={14} />Free delivery on orders over {formatMoney(FREE_DELIVERY_OVER)}</li>
            </ul>
            <h3>Storage &amp; care</h3>
            <ul>{CARE_NOTES[theme].map((note) => <li key={note}><Check size={14} />{note}</li>)}</ul>
          </div>
        ) : (
          <div id="panel-reviews" role="tabpanel" aria-labelledby="tab-reviews">
            <ReviewsPanel slug={product.slug} productName={product.name} focusForm={reviewRequest} />
          </div>
        )}
      </section>

      <SimilarProducts products={product.similar} viewAllHref={`#shop/${root.slug}`} viewAllLabel={`View all ${root.name.toLowerCase()}`} />
    </div>
  )
}
