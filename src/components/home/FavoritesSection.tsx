import { useState } from 'react'
import { favoriteProducts } from '../../constants/products'
import type { ProductCategory } from '../../types/product'
import { CategoryFilters } from './CategoryFilters'
import { ProductGrid } from './ProductGrid'
import { useRef } from 'react'
import { useSectionParallax } from '../../hooks/useSectionParallax'
import leftNuts from '../../assets/images/ChatGPT Image Jun 12, 2026, 04_05_10 PM 4.png'
import rightNuts from '../../assets/images/ChatGPT Image Jun 12, 2026, 04_05_10 PM 3.png'

type Filter = 'All' | ProductCategory

export function FavoritesSection() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All')
  const sectionRef = useRef<HTMLElement>(null)
  useSectionParallax(sectionRef)
  const visibleProducts = activeFilter === 'All'
    ? favoriteProducts
    : favoriteProducts.filter((product) => product.category === activeFilter)

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
        <div className="mx-auto max-w-2xl" data-reveal>
          <p className="eyebrow">Shop by mood</p>
          <h2 className="mt-2 font-display text-[clamp(2.6rem,5vw,4.5rem)] font-bold leading-none tracking-[-0.04em] text-stone-700 dark:text-stone-100">
            Everyday favourites
          </h2>
          <span className="mx-auto mt-2 block h-px w-36 bg-gradient-to-r from-transparent via-[#dfa55f] to-transparent" />
          <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
            From desk-drawer snacks to thoughtful gifts—find a better bite for every moment.
          </p>
        </div>

        <div className="relative z-20 mt-8">
          <CategoryFilters activeFilter={activeFilter} onChange={setActiveFilter} />
        </div>
        <div className="relative z-20 mt-14">
          <ProductGrid products={visibleProducts} />
        </div>
      </div>
    </section>
  )
}
