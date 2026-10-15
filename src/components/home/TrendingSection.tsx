import { ArrowUpRight, Check, Loader2, Plus, Sparkles, Star } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useGetProductsQuery } from '../../features/catalog/catalogApi'
import type { ProductSummary } from '../../types/api'
import { formatMoney } from '../../utils/format'
import { ProductImage } from '../catalog/ProductImage'
import { formatRating } from '../catalog/catalogFormat'
import { SkeletonLine } from '../catalog/Skeletons'
import { useQuickAdd } from '../catalog/useQuickAdd'

const LIMIT = 5

/** Trending products, falling back to the best rated when nothing is flagged trending. */
function useTrendingProducts() {
  const trending = useGetProductsQuery({ trending: true, limit: LIMIT })
  const needsFallback = trending.data !== undefined && trending.data.data.length === 0
  const topRated = useGetProductsQuery({ sort: 'rating', limit: LIMIT }, { skip: !needsFallback })
  return (needsFallback ? topRated.data : trending.data)?.data
}

function TickerCard({ product, index, onSelect }: { product: ProductSummary; index: number; onSelect: () => void }) {
  return (
    <button className="ticker-product group" type="button" onClick={onSelect} aria-label={`Show ${product.name}`}>
      <span className="ticker-card-surface">
        <span className="ticker-image size-[60px] shrink-0 overflow-hidden">
          <ProductImage className="size-full object-cover transition duration-700 ease-out group-hover:scale-[1.14]" image={product.image} alt="" sizes="60px" />
        </span>
        <span className="min-w-[130px] flex-1 text-left">
          <small className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[.24em] text-[#d9b57e]/70">
            Popular
            <span className="ticker-rule" />
            <span className="text-[#e9c589]/90">0{index + 1}</span>
          </small>
          <strong className="mt-1.5 block font-display text-[15px] font-bold leading-tight tracking-[-.01em] text-[#f8f2e6]">{product.name}</strong>
          <span className="mt-1 block text-[11.5px] font-bold tracking-[.02em] text-[#e9c187] tabular-nums">{formatMoney(product.price)}</span>
        </span>
        <span className="ticker-arrow shrink-0"><ArrowUpRight size={15} strokeWidth={2.4} /></span>
      </span>
    </button>
  )
}

export function TrendingSection() {
  const products = useTrendingProducts()
  const { quickAdd, isAdding } = useQuickAdd()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [addedId, setAddedId] = useState<string | null>(null)
  const tickerRef = useRef<HTMLDivElement>(null)
  const spotlightRef = useRef<HTMLElement>(null)
  const activeProduct = products?.find((product) => product.id === activeId) ?? products?.[1] ?? products?.[0]
  const hasProducts = Boolean(products?.length)

  useEffect(() => {
    const ticker = tickerRef.current
    if (!ticker || !hasProducts || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0

    const updateDepth = () => {
      const viewportCenter = window.innerWidth / 2
      const depthRange = Math.max(window.innerWidth * 0.52, 420)
      ticker.querySelectorAll<HTMLElement>('.ticker-product').forEach((card) => {
        const rect = card.getBoundingClientRect()
        const cardCenter = rect.left + rect.width / 2
        const signedDistance = (cardCenter - viewportCenter) / depthRange
        const distance = Math.min(Math.abs(signedDistance), 1)
        card.style.setProperty('--marquee-scale', `${1 - distance * 0.08}`)
        card.style.setProperty('--marquee-opacity', `${1 - distance * 0.3}`)
        card.style.setProperty('--marquee-rotate', `${signedDistance * -5}deg`)
        card.style.setProperty('--marquee-focus', `${Math.max(0, 1 - distance * 1.6)}`)
      })
      frame = window.requestAnimationFrame(updateDepth)
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !frame) frame = window.requestAnimationFrame(updateDepth)
      if (!entry.isIntersecting && frame) {
        window.cancelAnimationFrame(frame)
        frame = 0
      }
    })
    observer.observe(ticker)
    return () => {
      observer.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [hasProducts])

  // Rotate the spotlight every few seconds while the section is on screen.
  useEffect(() => {
    if (!products || products.length < 2) return
    const timer = window.setInterval(() => {
      const spotlight = spotlightRef.current
      if (spotlight && spotlight.matches(':hover, :focus-within')) return
      setActiveId((currentId) => {
        const currentIndex = Math.max(0, products.findIndex((product) => product.id === currentId))
        return products[(currentIndex + 1) % products.length].id
      })
    }, 5000)
    return () => window.clearInterval(timer)
  }, [products])

  useEffect(() => {
    if (!addedId) return
    const timer = window.setTimeout(() => setAddedId(null), 1600)
    return () => window.clearTimeout(timer)
  }, [addedId])

  const addFeatured = async () => {
    if (!activeProduct) return
    if (await quickAdd(activeProduct)) setAddedId(activeProduct.id)
  }

  const tickerProducts = products ? [...products, ...products] : []
  const isAdded = addedId !== null && addedId === activeProduct?.id
  const adding = activeProduct ? isAdding(activeProduct.id) : false

  if (products && !products.length) return null

  return (
    <section className="overflow-hidden bg-[#f8f5ee] pb-28 dark:bg-stone-950" id="trending">
      <div className="product-ticker" aria-label="Popular product scroller" ref={tickerRef}>
        <div className="ticker-grain" aria-hidden="true" />
        <div className="scroller-glow scroller-glow-one" aria-hidden="true" />
        <div className="scroller-glow scroller-glow-two" aria-hidden="true" />
        <div className="product-ticker-viewport">
          <div className="product-ticker-track relative flex w-max items-center gap-4 pr-4" aria-label="Popular products">
            {products
              ? tickerProducts.map((product, index) => (
                <TickerCard key={`${product.id}-${index}`} product={product} index={index % products.length} onSelect={() => setActiveId(product.id)} />
              ))
              : Array.from({ length: 8 }, (_, index) => <span className="ticker-skeleton" key={index} aria-hidden="true" />)}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1180px] px-5 pt-24 sm:px-8">
        <header className="mb-11 flex flex-col gap-5 md:flex-row md:items-end md:justify-between" data-reveal>
          <div>
            <p className="eyebrow">The weekly edit</p>
            <h2 className="mt-3 font-display text-[clamp(2.8rem,5vw,4.7rem)] font-bold leading-[.9] tracking-[-.045em] text-[#173f32] dark:text-white">Trending now,<br /><span className="italic text-[#b77838]">loved always.</span></h2>
          </div>
          <p className="max-w-[355px] text-sm leading-7 text-stone-500">The flavours customers can&apos;t stop reaching for—curated fresh every week.</p>
        </header>

        <div className="trending-editorial grid overflow-hidden rounded-[36px] border border-[#ded5c6] bg-white shadow-[0_30px_70px_rgba(44,37,27,.1)] dark:border-stone-800 dark:bg-stone-900 lg:grid-cols-[1.35fr_.65fr]" data-reveal>
          <article ref={spotlightRef} className="trending-spotlight relative isolate flex min-h-[540px] flex-col overflow-hidden bg-[#173f32] p-7 text-white sm:p-10 lg:min-h-[610px]" aria-live="polite">
            <div className="absolute -right-24 -top-24 -z-10 size-[430px] rounded-full border border-white/10" />
            <div className="absolute -bottom-32 -left-16 -z-10 size-[340px] rounded-full bg-[#d39a4b]/15 blur-2xl" />
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-[9px] font-bold uppercase tracking-[.16em] text-[#efd6a4]"><Sparkles size={12} /> Editor&apos;s pick</span>
              {activeProduct && activeProduct.reviewCount > 0 && <span className="flex items-center gap-1 text-xs text-[#f1d38f]" aria-label={`Rated ${formatRating(activeProduct.rating)} out of 5`}><Star size={13} fill="currentColor" /> {formatRating(activeProduct.rating)}</span>}
            </div>

            <div className="relative flex flex-1 items-center justify-center py-8">
              <span className="absolute size-[280px] rounded-full bg-[#f2dfb8] sm:size-[370px]" />
              {activeProduct ? (
                <a className="spotlight-image relative z-10 block size-[260px] overflow-hidden rounded-full shadow-[0_30px_35px_rgba(0,0,0,.28)] sm:size-[340px]" href={`#product/${activeProduct.slug}`} key={activeProduct.id} aria-label={`View ${activeProduct.name}`}>
                  <ProductImage className="size-full object-cover" image={activeProduct.image} alt={activeProduct.name} sizes="(min-width: 640px) 340px, 260px" />
                </a>
              ) : (
                <span className="catalog-skeleton relative z-10 block size-[260px] rounded-full opacity-40 sm:size-[340px]" aria-hidden="true" />
              )}
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              {activeProduct ? (
                <div className="spotlight-copy" key={`copy-${activeProduct.id}`}>
                  <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#d5b77f]">This week&apos;s favourite</p>
                  <h3 className="mt-2 font-display text-3xl font-bold sm:text-4xl"><a className="hover:text-[#f0d59f]" href={`#product/${activeProduct.slug}`}>{activeProduct.name}</a></h3>
                  <p className="mt-2 text-xl font-bold text-[#efcd86]">{formatMoney(activeProduct.price)}</p>
                </div>
              ) : (
                <div className="w-full max-w-xs space-y-3 opacity-30"><SkeletonLine className="h-2.5 w-28" /><SkeletonLine className="h-8 w-60" /><SkeletonLine className="h-5 w-20" /></div>
              )}
              <button
                className={`inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold transition hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0d59f] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${isAdded ? 'bg-[#668c77] text-white' : 'bg-white text-[#173f32] hover:bg-[#f0d59f]'}`}
                type="button"
                onClick={addFeatured}
                disabled={!activeProduct || adding || !activeProduct.inStock}
                aria-busy={adding}
              >
                {adding ? <Loader2 className="animate-spin" size={17} /> : isAdded ? <Check size={17} /> : <Plus size={17} />}
                {activeProduct && !activeProduct.inStock ? 'Sold out' : isAdded ? 'Added to bag' : 'Add to bag'}
              </button>
            </div>
          </article>

          <aside className="flex flex-col p-4 sm:p-6">
            <div className="mb-3 flex items-center justify-between px-2 py-2"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-stone-400">Choose your favourite</p><ArrowUpRight className="text-[#ad7135]" size={18} /></div>
            <div className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {products
                ? products.map((product, index) => {
                  const isActive = product.id === activeProduct?.id
                  return (
                    <button className={`trending-choice group flex items-center gap-4 rounded-[20px] border p-3 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#caa56b] ${isActive ? 'border-[#caa56b] bg-[#f6efe3] dark:bg-stone-800' : 'border-transparent hover:border-[#e6ddd0] hover:bg-[#faf7f1] dark:hover:bg-stone-800/60'}`} key={product.id} type="button" onClick={() => setActiveId(product.id)} aria-pressed={isActive}>
                      <span className="grid size-[72px] shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#eee5d7]"><ProductImage className="size-full object-cover transition duration-500 group-hover:scale-110" image={product.image} alt="" sizes="72px" /></span>
                      <span className="min-w-0 flex-1"><small className="text-[9px] font-bold uppercase tracking-[.13em] text-stone-400">0{index + 1}</small><strong className="mt-1 block truncate text-sm text-[#173f32] dark:text-white">{product.name}</strong><span className="mt-1 block text-xs font-bold text-[#b57437]">{formatMoney(product.price)}</span></span>
                      <span className={`size-2 rounded-full transition ${isActive ? 'scale-100 bg-[#b87939]' : 'scale-0 bg-transparent'}`} />
                    </button>
                  )
                })
                : Array.from({ length: LIMIT }, (_, index) => (
                  <span className="flex items-center gap-4 p-3" key={index} aria-hidden="true"><span className="catalog-skeleton size-[72px] shrink-0 rounded-2xl" /><span className="flex-1 space-y-2"><SkeletonLine className="h-2 w-8" /><SkeletonLine className="h-3 w-32" /><SkeletonLine className="h-2.5 w-14" /></span></span>
                ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
