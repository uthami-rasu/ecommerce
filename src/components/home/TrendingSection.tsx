import { useState } from 'react'
import { trendingCategories, trendingProducts } from '../../constants/trendingProducts'
import type { ProductCategory } from '../../types/product'
import { CategoryFilters } from './CategoryFilters'
import { TrendingGrid } from './TrendingGrid'

export function TrendingSection() {
  const [activeCategory, setActiveCategory] =
    useState<'All' | ProductCategory>('All')
  const visibleProducts = activeCategory === 'All'
    ? trendingProducts
    : trendingProducts.filter((product) => product.category === activeCategory)

  return (
    <section className="relative overflow-hidden bg-white pb-28 dark:bg-stone-950" id="trending">
      <div className="marquee-shell mb-20 rotate-[-1deg] overflow-hidden border-y border-[#dfd2bc] bg-[#f2e8d7] py-3 text-[#214638]">
        <div className="marquee-track whitespace-nowrap text-[10px] font-bold uppercase tracking-[.24em]" aria-hidden="true">Naturally delicious&nbsp; ✦ &nbsp;Freshly packed&nbsp; ✦ &nbsp;Everyday energy&nbsp; ✦ &nbsp;Nothing unnecessary&nbsp; ✦ &nbsp;Naturally delicious&nbsp; ✦ &nbsp;Freshly packed&nbsp; ✦ &nbsp;Everyday energy&nbsp; ✦ &nbsp;Nothing unnecessary&nbsp; ✦ &nbsp;</div>
      </div>
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <header className="mb-9 flex flex-col gap-5 md:flex-row md:items-center md:justify-between" data-reveal>
          <h2 className="font-display text-[clamp(2.25rem,4vw,3.25rem)] font-bold leading-none tracking-[-0.035em] text-stone-950 dark:text-stone-50">
            Trending{' '}
            <span className="natural-mark relative inline-block px-1">Products</span>
          </h2>
          <CategoryFilters
            activeFilter={activeCategory}
            categories={trendingCategories}
            onChange={setActiveCategory}
          />
        </header>
        <TrendingGrid products={visibleProducts} />
      </div>
    </section>
  )
}
