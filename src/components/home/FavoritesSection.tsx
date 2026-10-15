import { useMemo, useRef, useState } from 'react'
import { ArrowRight, RotateCcw } from 'lucide-react'
import { useGetCategoriesQuery, useGetProductsQuery } from '../../features/catalog/catalogApi'
import { useSectionParallax } from '../../hooks/useSectionParallax'
import { leafCategories } from '../catalog/categoryTree'
import { CategoryFilters } from './CategoryFilters'
import { ProductGrid } from './ProductGrid'
import leftNuts from '../../assets/images/ChatGPT Image Jun 12, 2026, 04_05_10 PM 4.webp'
import rightNuts from '../../assets/images/ChatGPT Image Jun 12, 2026, 04_05_10 PM 3.webp'

const LIMIT = 8

export function FavoritesSection() {
  const [active, setActive] = useState('')
  const sectionRef = useRef<HTMLElement>(null)
  useSectionParallax(sectionRef)

  const { data: tree } = useGetCategoriesQuery()
  const chips = useMemo(() => leafCategories(tree).map(({ slug, name }) => ({ slug, name })), [tree])
  const category = active || undefined

  // Featured picks first; a category without featured products falls back to its full range.
  const featured = useGetProductsQuery({ featured: true, category, limit: LIMIT })
  const needsFallback = featured.currentData !== undefined && featured.currentData.data.length === 0
  const fallback = useGetProductsQuery({ category, limit: LIMIT }, { skip: !needsFallback })
  const source = needsFallback ? fallback : featured
  const products = source.currentData?.data
  const failed = source.isError && !products

  return (
    <section
      ref={sectionRef}
      className="favorites-parallax-section relative z-10 overflow-hidden px-5 pb-24 pt-16 text-center sm:px-8"
      id="favorites"
    >
      <img className="favorites-parallax-left pointer-events-none absolute -bottom-28 -left-24 -z-10 hidden w-[320px] select-none opacity-35 lg:block" src={leftNuts} alt="" aria-hidden="true" />
      <img className="favorites-parallax-right pointer-events-none absolute -bottom-28 -right-24 -z-10 hidden w-[320px] select-none opacity-35 lg:block" src={rightNuts} alt="" aria-hidden="true" />
      <div className="favorites-orbit favorites-orbit-one" aria-hidden="true" />
      <div className="favorites-orbit favorites-orbit-two" aria-hidden="true" />
      <div className="favorites-depth-content">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/40 shadow-sm mb-3">
            ✨ Hand-curated Selection
          </span>
          <h2 className="font-display text-[clamp(2.6rem,5vw,4.5rem)] font-bold leading-none tracking-[-0.04em] text-[#173f32] dark:text-stone-100">
            Everyday Favourites
          </h2>
          <span className="mx-auto mt-3 block h-1 w-24 rounded-full bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 shadow-[0_0_10px_#f59e0b]" />
          <p className="mt-4 text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed">
            From desk-drawer artisan jars to thoughtful luxury gift sets—find a better taste for every special moment.
          </p>
        </div>

        <div className="relative z-20 mt-8 min-h-9">
          {chips.length > 0 && <CategoryFilters active={active} categories={chips} onChange={setActive} />}
        </div>
        <div className="relative z-20 mt-14">
          {failed ? (
            <div className="mx-auto grid max-w-md place-items-center gap-3 rounded-3xl border border-dashed border-stone-300 bg-white/70 px-6 py-14 text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-900/60" role="alert">
              <p>We couldn’t load our favourites right now.</p>
              <button className="inline-flex items-center gap-2 rounded-full bg-[#173f32] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#1e5040]" type="button" onClick={() => source.refetch()}><RotateCcw size={13} /> Try again</button>
            </div>
          ) : products && products.length === 0 ? (
            <p className="mx-auto max-w-md rounded-3xl border border-dashed border-stone-300 px-6 py-14 text-sm text-stone-500 dark:border-stone-700">Nothing here yet — new harvests are on their way.</p>
          ) : (
            <ProductGrid products={products} loading={!products} skeletons={LIMIT} />
          )}
          <a
            className="group mt-12 inline-flex items-center gap-2 rounded-full border border-[#173f32]/15 bg-white/80 px-6 py-3 text-xs font-bold uppercase tracking-[.14em] text-[#173f32] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-[#D9B27C] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9B27C] dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-100"
            href={active ? `#shop/${active}` : '#shop'}
          >
            Shop the full collection <ArrowRight className="transition group-hover:translate-x-1" size={14} />
          </a>
        </div>
      </div>
    </section>
  )
}
