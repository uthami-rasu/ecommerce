import { useState } from 'react'
import { BadgeCheck, Gift, MessageCircle, Phone, RotateCcw, SlidersHorizontal, X } from 'lucide-react'
import { Footer } from '../components/layout/Footer'
import { useQuickAdd } from '../components/catalog/useQuickAdd'
import { GiftEnquiryDialog } from '../components/gifts/GiftEnquiryDialog'
import { GiftProductCard, GiftProductCardSkeleton } from '../components/gifts/GiftProductCard'
import { GiftIconView } from '../components/gifts/giftIcons'
import { useGetProductsQuery } from '../features/catalog/catalogApi'
import { useGetGiftPageQuery } from '../features/gifting/giftingApi'
import { useRoute } from '../hooks/useRoute'
import { useWishlist } from '../hooks/useWishlist'
import { errorMessage } from '../lib/http/apiClient'
import type { GiftBudgetTier, GiftEnquiryKind, GiftOccasion, GiftPageContent, ProductQuery, ProductSort, ProductSummary } from '../types/api'
import { navigate } from '../utils/router'
import heroFallback from '../assets/images/unsplash-dry-fruit-bowls.webp'
import bulkFallback from '../assets/images/unsplash-dry-fruit-market.webp'
import customizeFallback from '../assets/images/gift-customize-banner.webp'
import occasionWeddingsFallback from '../assets/images/occasion-weddings.webp'
import occasionBabyShowerFallback from '../assets/images/occasion-baby-shower.webp'
import occasionHouseWarmingFallback from '../assets/images/occasion-house-warming.webp'
import occasionBirthdayFallback from '../assets/images/occasion-birthday.webp'
import occasionCorporateFallback from '../assets/images/occasion-corporate.webp'

const PAGE_SIZE = 8

const SORTS: Array<{ value: ProductSort; label: string }> = [
  { value: 'featured', label: 'Popularity' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
]

const tierQuery = (tier: GiftBudgetTier | undefined): Pick<ProductQuery, 'minPrice' | 'maxPrice'> =>
  tier ? { minPrice: tier.minPrice ?? undefined, maxPrice: tier.maxPrice ?? undefined } : {}

const scrollToListing = () =>
  document.getElementById('gift-listing')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

export function GiftsPage() {
  const route = useRoute()
  const { data, isLoading, error, refetch } = useGetGiftPageQuery()
  const [enquiry, setEnquiry] = useState<GiftEnquiryKind | null>(null)

  const occasionSlug = route.query.get('occasion') ?? undefined
  const budgetIndex = route.query.get('budget')
  const sort = (SORTS.find((item) => item.value === route.query.get('sort'))?.value ?? 'featured') as ProductSort

  const setFilters = (next: { occasion?: string | null; budget?: number | null; sort?: ProductSort }, scroll = false) => {
    const current = {
      occasion: occasionSlug,
      budget: budgetIndex ?? undefined,
      sort: sort === 'featured' ? undefined : sort,
    }
    navigate('gifts', {
      replace: true,
      query: {
        occasion: next.occasion === undefined ? current.occasion : next.occasion ?? undefined,
        budget: next.budget === undefined ? current.budget : next.budget === null ? undefined : String(next.budget),
        sort: next.sort === undefined ? current.sort : next.sort === 'featured' ? undefined : next.sort,
      },
    })
    if (scroll) setTimeout(scrollToListing, 30)
  }

  if (isLoading) return <GiftsPageSkeleton />
  if (!data) {
    return (
      <main className="grid min-h-[60vh] place-items-center px-6 text-center">
        <div role="alert">
          <Gift className="mx-auto text-[#b9773a]" size={36} />
          <h1 className="mt-4 font-display text-3xl font-bold text-[#173f32] dark:text-stone-100">We couldn’t load the gift collection</h1>
          <p className="mt-2 text-sm text-stone-500">{errorMessage(error)}</p>
          <button type="button" onClick={refetch} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#173f32] px-6 py-2.5 text-sm font-bold text-white">
            <RotateCcw size={14} /> Try again
          </button>
        </div>
      </main>
    )
  }

  const { content, occasions } = data
  const occasion = occasions.find((item) => item.slug === occasionSlug)
  const tiers = content.budget.enabled ? content.budget.tiers : []
  const tier = budgetIndex !== null ? tiers[Number(budgetIndex)] : undefined

  return (
    <main className="bg-[#fbf8f2] text-stone-800 dark:bg-stone-950 dark:text-stone-100">
      <GiftHero hero={content.hero} />

      <section id="gift-listing" className="mx-auto max-w-6xl scroll-mt-28 px-4 pb-16 pt-10 sm:px-6">
        <OccasionChips occasions={occasions} active={occasion?.slug} onSelect={(slug) => setFilters({ occasion: slug })} />
        <GiftListing
          // A new filter starts again from the first page.
          key={`${occasion?.slug}:${budgetIndex}:${sort}`}
          title={content.listing.title}
          query={{ gift: true, occasion: occasion?.slug, sort, ...tierQuery(tier) }}
          sort={sort}
          tier={tier}
          occasion={occasion}
          onSort={(value) => setFilters({ sort: value })}
          onClearBudget={() => setFilters({ budget: null })}
          onClearAll={() => setFilters({ occasion: null, budget: null })}
        />
      </section>

      {content.customize.enabled && <CustomizeBanner customize={content.customize} onStart={() => setEnquiry('customize')} />}
      {content.occasions.enabled && (
        <OccasionShowcase title={content.occasions.title} occasions={occasions.filter((item) => item.isFeatured)} onSelect={(slug) => setFilters({ occasion: slug }, true)} />
      )}
      {tiers.length > 0 && (
        <BudgetSection budget={content.budget} active={tier ? Number(budgetIndex) : null} onSelect={(index) => setFilters({ budget: index }, true)} />
      )}
      {content.bulk.enabled && <BulkSection bulk={content.bulk} onRequest={() => setEnquiry('bulk')} />}
      {content.features.enabled && content.features.items.length > 0 && <FeatureStrip items={content.features.items} />}

      <GiftEnquiryDialog kind={enquiry} occasions={occasions} occasion={occasion?.name} onClose={() => setEnquiry(null)} />
      <Footer />
    </main>
  )
}

// ── Hero ─────────────────────────────────────────────────

function GiftHero({ hero }: { hero: GiftPageContent['hero'] }) {
  const whatsapp = `https://wa.me/${hero.whatsappNumber}${hero.whatsappMessage ? `?text=${encodeURIComponent(hero.whatsappMessage)}` : ''}`
  return (
    <section className="relative isolate overflow-hidden">
      <img src={hero.imageUrl ?? heroFallback} alt="" className="absolute inset-0 -z-20 size-full object-cover" fetchPriority="high" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/50 to-black/65" aria-hidden />
      <div className="mx-auto flex min-h-[420px] max-w-4xl flex-col items-center justify-center px-5 py-24 text-center text-white sm:min-h-[480px]">
        {hero.eyebrow && <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#b8d26a]">{hero.eyebrow}</p>}
        <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] sm:text-6xl">{hero.title}</h1>
        {hero.subtitle && <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">{hero.subtitle}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={`tel:${hero.phone.replace(/[^\d+]/g, '')}`} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#4f7f46] px-6 text-sm font-bold text-white shadow-lg ring-1 ring-white/20 transition hover:bg-[#5d9152]">
            {hero.callLabel} <Phone size={15} />
          </a>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-[#173f32] shadow-lg transition hover:bg-stone-100">
            {hero.whatsappLabel} <MessageCircle size={15} />
          </a>
        </div>
      </div>
    </section>
  )
}

// ── Filters & listing ────────────────────────────────────

function OccasionChips({ occasions, active, onSelect }: { occasions: GiftOccasion[]; active?: string; onSelect: (slug: string | null) => void }) {
  const chip = (selected: boolean) =>
    `shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173f32] ${
      selected
        ? 'bg-[#d4a373] text-white shadow-md'
        : 'bg-white text-stone-700 ring-1 ring-stone-200 hover:ring-[#d4a373] dark:bg-stone-900 dark:text-stone-200 dark:ring-stone-700'
    }`
  return (
    <nav aria-label="Filter by occasion" className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
      <button type="button" aria-pressed={!active} onClick={() => onSelect(null)} className={chip(!active)}>All Occasions</button>
      {occasions.map((item) => (
        <button key={item.id} type="button" aria-pressed={active === item.slug} onClick={() => onSelect(item.slug)} className={chip(active === item.slug)}>
          {item.name}
        </button>
      ))}
    </nav>
  )
}

type GiftListingProps = {
  title: string
  query: ProductQuery
  sort: ProductSort
  tier?: GiftBudgetTier
  occasion?: GiftOccasion
  onSort: (sort: ProductSort) => void
  onClearBudget: () => void
  onClearAll: () => void
}

function GiftListing({ title, query, sort, tier, occasion, onSort, onClearBudget, onClearAll }: GiftListingProps) {
  const [pages, setPages] = useState(1)
  const key = JSON.stringify(query)

  const first = useGetProductsQuery({ ...query, page: 1, limit: PAGE_SIZE })
  const total = first.data?.meta.total ?? 0

  return (
    <>
      <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-[#173f32] dark:text-stone-50 sm:text-4xl">{title}</h2>
          <p className="mt-1 text-xs italic text-stone-500 dark:text-stone-400" aria-live="polite">
            {first.isFetching && !first.data ? 'Loading gift collections…' : `Showing ${total} curated gift ${total === 1 ? 'collection' : 'collections'}${occasion ? ` for ${occasion.name}` : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tier && (
            <button type="button" onClick={onClearBudget} className="inline-flex items-center gap-1.5 rounded-full bg-[#173f32] px-3 py-1.5 text-[11px] font-semibold text-white">
              {tier.title} <X size={12} aria-label="Clear budget filter" />
            </button>
          )}
          <label className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[11px] text-stone-500 ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-700">
            Sort by:
            <select value={sort} onChange={(event) => onSort(event.target.value as ProductSort)} className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none dark:text-stone-100">
              {SORTS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <span className="grid size-9 place-items-center rounded-lg bg-[#d4a373] text-white" aria-hidden>
            <SlidersHorizontal size={15} />
          </span>
        </div>
      </div>

      {first.error ? (
        <div role="alert" className="mt-10 rounded-2xl bg-white p-8 text-center ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-800">
          <p className="text-sm text-stone-600">{errorMessage(first.error)}</p>
          <button type="button" onClick={first.refetch} className="mt-4 rounded-full bg-[#173f32] px-5 py-2 text-sm font-bold text-white">Try again</button>
        </div>
      ) : first.data && total === 0 ? (
        <div className="mt-10 rounded-2xl bg-white p-10 text-center ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-800">
          <Gift className="mx-auto text-[#d4a373]" size={32} aria-hidden />
          <p className="mt-3 font-display text-2xl font-bold text-[#173f32] dark:text-stone-100">No gifts match these filters yet</p>
          <button type="button" onClick={onClearAll} className="mt-4 rounded-full border border-[#d4a373] px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#b9773a]">Show all gifts</button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: pages }, (_, index) => <GiftProductPage key={`${key}:${index}`} query={query} page={index + 1} />)}
        </div>
      )}

      {pages * PAGE_SIZE < total && (
        <div className="mt-10 text-center">
          <button type="button" onClick={() => setPages((current) => current + 1)} className="rounded-full border border-[#d4a373] px-8 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#b9773a] transition hover:bg-[#fbf3e6] dark:hover:bg-stone-900">
            Load more gifts
          </button>
        </div>
      )}
    </>
  )
}

/** One page of results; "Load more" appends another page, each cached on its own. */
function GiftProductPage({ query, page }: { query: ProductQuery; page: number }) {
  const { data, isLoading } = useGetProductsQuery({ ...query, page, limit: PAGE_SIZE })
  const { quickAdd, isAdding } = useQuickAdd()
  const { isWished, toggle } = useWishlist()

  if (isLoading || !data) return <>{Array.from({ length: 4 }, (_, index) => <GiftProductCardSkeleton key={index} />)}</>

  const buyNow = async (product: ProductSummary) => {
    // Checkout signs guests in first; their cart is merged into the account.
    if (await quickAdd(product, 1, { silent: true })) navigate('checkout')
  }

  return (
    <>
      {data.data.map((product) => (
        <GiftProductCard
          key={product.id}
          product={product}
          wished={isWished(product.id)}
          busy={isAdding(product.id)}
          onWish={() => toggle(product)}
          onAdd={() => quickAdd(product)}
          onBuy={() => void buyNow(product)}
        />
      ))}
    </>
  )
}

// ── Content sections ─────────────────────────────────────

function CustomizeBanner({ customize, onStart }: { customize: GiftPageContent['customize']; onStart: () => void }) {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="relative grid items-center gap-8 overflow-hidden rounded-3xl bg-[#f1e8dc] px-6 py-10 dark:bg-stone-900 sm:px-10 md:grid-cols-[1.2fr_1fr]">
        <Gift className="pointer-events-none absolute right-[18%] top-1/2 hidden -translate-y-1/2 text-[#e2d4c1] dark:text-stone-800 md:block" size={220} strokeWidth={1} aria-hidden />
        <div className="relative">
          <h2 className="font-display text-3xl font-bold text-[#173f32] dark:text-stone-50">{customize.title}</h2>
          {customize.body && <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-600 dark:text-stone-300">{customize.body}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button type="button" onClick={onStart} className="rounded-full bg-[#173f32] px-6 py-3 text-xs font-bold text-white shadow-lg transition hover:bg-[#1e5040]">{customize.ctaLabel}</button>
            {customize.note && (
              <span className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300">
                <BadgeCheck size={15} className="text-[#d6941a]" aria-hidden /> {customize.note}
              </span>
            )}
          </div>
        </div>
        <img
          src={customize.imageUrl ?? customizeFallback}
          alt=""
          loading="lazy"
          className="relative mx-auto aspect-[4/3] w-full max-w-xs rounded-xl object-cover shadow-xl md:justify-self-end"
        />
      </div>
    </section>
  )
}

/** Fallback images for occasion cards that don't yet have an admin-uploaded photo. */
const OCCASION_FALLBACKS: Record<string, string> = {
  'weddings': occasionWeddingsFallback,
  'baby-shower': occasionBabyShowerFallback,
  'house-warming': occasionHouseWarmingFallback,
  'birthday-party': occasionBirthdayFallback,
  'corporate-events': occasionCorporateFallback,
}

function OccasionShowcase({ title, occasions, onSelect }: { title: string; occasions: GiftOccasion[]; onSelect: (slug: string) => void }) {

  if (!occasions.length) return null
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-center font-display text-3xl font-bold text-[#173f32] dark:text-stone-50">{title}</h2>
      <span className="mx-auto mt-3 block h-0.5 w-12 rounded bg-[#d6941a]" aria-hidden />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {occasions.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.slug)}
            className="group relative isolate block aspect-[4/3.3] overflow-hidden rounded-2xl text-left shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#173f32]"
          >
            <img
              src={item.imageUrl ?? OCCASION_FALLBACKS[item.slug] ?? occasionWeddingsFallback}
              alt=""
              loading="lazy"
              className="absolute inset-0 -z-20 size-full object-cover transition duration-700 group-hover:scale-105"
            />
            <span className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/25 to-transparent" aria-hidden />
            <span className="absolute inset-x-0 bottom-0 p-5 text-white">
              <span className="block font-display text-2xl font-bold">{item.name}</span>
              {item.tagline && <span className="mt-1 block text-xs text-white/80">{item.tagline}</span>}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

function BudgetSection({ budget, active, onSelect }: { budget: GiftPageContent['budget']; active: number | null; onSelect: (index: number) => void }) {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="rounded-3xl bg-[#1d4632] px-6 py-12 text-center text-white sm:px-10">
        <h2 className="font-display text-3xl font-bold">{budget.title}</h2>
        {budget.subtitle && <p className="mt-2 text-xs text-white/60">{budget.subtitle}</p>}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {budget.tiers.map((tier, index) => {
            return (
              <button
                key={`${tier.title}-${index}`}
                type="button"
                aria-pressed={active === index}
                onClick={() => onSelect(index)}
                className={`rounded-2xl px-4 py-6 ring-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9cf9f] ${
                  active === index ? 'bg-white/20 ring-[#e9cf9f]' : 'bg-white/[0.07] ring-white/10 hover:bg-white/[0.12]'
                }`}
              >
                {tier.label && <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#e2b65f]">{tier.label}</span>}
                <span className="mt-2 block font-display text-2xl font-bold">{tier.title}</span>
                <span className="mx-auto mt-4 grid size-8 place-items-center rounded-full bg-[#e2b65f]/20 text-[#e2b65f]"><GiftIconView name={tier.icon} size={14} /></span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function BulkSection({ bulk, onRequest }: { bulk: GiftPageContent['bulk']; onRequest: () => void }) {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2">
      <img src={bulk.imageUrl ?? bulkFallback} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover shadow-xl" />
      <div>
        <h2 className="font-display text-3xl font-bold leading-tight text-[#173f32] dark:text-stone-50 sm:text-4xl">{bulk.title}</h2>
        <ul className="mt-6 grid gap-5">
          {bulk.points.map((point, index) => {
            return (
              <li key={`${point.title}-${index}`} className="flex gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#f6ead4] text-[#b9773a] dark:bg-stone-800"><GiftIconView name={point.icon} size={15} /></span>
                <span>
                  <b className="block text-sm font-semibold text-stone-800 dark:text-stone-100">{point.title}</b>
                  {point.body && <span className="mt-0.5 block text-xs leading-relaxed text-stone-500 dark:text-stone-400">{point.body}</span>}
                </span>
              </li>
            )
          })}
        </ul>
        <button type="button" onClick={onRequest} className="mt-8 rounded-full bg-[#173f32] px-7 py-3 text-xs font-bold text-white shadow-lg transition hover:bg-[#1e5040]">{bulk.ctaLabel}</button>
      </div>
    </section>
  )
}

function FeatureStrip({ items }: { items: GiftPageContent['features']['items'] }) {
  return (
    <section className="mx-auto max-w-6xl border-t border-stone-200 px-4 py-12 dark:border-stone-800 sm:px-6">
      <ul className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item, index) => {
          return (
            <li key={`${item.title}-${index}`} className="text-center">
              <span className="mx-auto grid size-11 place-items-center rounded-full bg-white text-[#d6941a] shadow-sm ring-1 ring-stone-200/70 dark:bg-stone-900 dark:ring-stone-800"><GiftIconView name={item.icon} size={18} /></span>
              <b className="mt-3 block text-xs font-semibold text-stone-800 dark:text-stone-100">{item.title}</b>
              {item.subtitle && <span className="mt-0.5 block text-[10px] text-stone-500">{item.subtitle}</span>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function GiftsPageSkeleton() {
  return (
    <main className="bg-[#fbf8f2] dark:bg-stone-950" role="status" aria-label="Loading return gifts">
      <div className="h-[420px] animate-pulse bg-stone-300/60 dark:bg-stone-800" />
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-4 py-16 min-[480px]:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => <GiftProductCardSkeleton key={index} />)}
      </div>
    </main>
  )
}
