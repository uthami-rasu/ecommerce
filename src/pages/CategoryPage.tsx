import { useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import {
  AlertCircle, ChevronDown, Filter, Grid2X2, Info, LayoutList, Loader2, Minus, PackageCheck, RotateCcw, ShieldCheck, Sparkles, Truck, X,
} from 'lucide-react'
import { Footer } from '../components/layout/Footer'
import { StatsBand } from '../components/home/StatsBand'
import { NewsletterSection } from '../components/home/NewsletterSection'
import { CatalogProductCard, Tooltip, type ViewMode } from '../components/catalog/CatalogProductCard'
import { FilterPanel, type CatalogFilters, type CategoryOption } from '../components/catalog/FilterPanel'
import { CatalogCardSkeleton } from '../components/catalog/Skeletons'
import { findCategory, themeOf, type CatalogTheme, type CategoryMatch } from '../components/catalog/categoryTree'
import { useQuickAdd } from '../components/catalog/useQuickAdd'
import { useGetCategoriesQuery, useGetProductsQuery } from '../features/catalog/catalogApi'
import { useRoute } from '../hooks/useRoute'
import { useWishlist } from '../hooks/useWishlist'
import { errorMessage } from '../lib/http/apiClient'
import type { Category, ProductQuery, ProductSort, ProductSummary } from '../types/api'
import honeyHeroBg from '../assets/category/image copy.webp'
import dryFruitHeroBg from '../assets/images/unsplash-dry-fruit-bowls.webp'
import pantryHeroBg from '../assets/images/unsplash-nut-market.webp'
import '../styles/catalog.css'

const PAGE_SIZE = 12

const SORTS: Array<{ value: ProductSort; label: string }> = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest first' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
]

type ThemeCopy = {
  image: string
  eyebrow: string
  title: ReactNode
  intro: string
  roomLabel: string
  roomTitle: string
  roomIntro: string
  allLabel: string
  heading: string
  sizeLabel: string
  note: { title: string; body: string }
  emptyTitle: string
}

const THEMES: Record<CatalogTheme, ThemeCopy> = {
  honey: {
    image: honeyHeroBg,
    eyebrow: 'Small-batch · Raw · Traceable',
    title: <>Nature’s gold,<br /><em className="font-semibold text-[#efc87e]">bottled slowly.</em></>,
    intro: 'Discover rare honey gathered from forest, meadow and mountain bloom — untouched by heat and fully traceable to its native landscape.',
    roomLabel: 'The honey room',
    roomTitle: 'A harvest for every palate',
    roomIntro: 'Single-origin jars and thoughtful pairings, sourced in limited seasonal batches.',
    allLabel: 'All honey',
    heading: 'Honey varieties',
    sizeLabel: 'Jar size',
    note: { title: 'Nothing unnecessary', body: 'Every jar is raw, traceable and packed without artificial flavouring.' },
    emptyTitle: 'No jars match those filters',
  },
  'dry-fruits': {
    image: dryFruitHeroBg,
    eyebrow: 'Hand-sorted · Slow-roasted · Fresh-packed',
    title: <>Nature’s crunch,<br /><em className="font-semibold text-[#efc87e]">packed with care.</em></>,
    intro: 'Premium nuts, sun-dried fruits and traditional snacks from trusted growers — sorted by hand and packed fresh after you order.',
    roomLabel: 'The nut pantry',
    roomTitle: 'Crunch for every craving',
    roomIntro: 'Wholesome everyday snacking and gifting staples, roasted and dried in small batches.',
    allLabel: 'All dry fruits & nuts',
    heading: 'Dry fruits & nuts',
    sizeLabel: 'Pack size',
    note: { title: 'Fresh, never stale', body: 'Packed in small batches with no added preservatives or artificial colour.' },
    emptyTitle: 'Nothing matches those filters',
  },
  all: {
    image: pantryHeroBg,
    eyebrow: 'Honey · Nuts · Dried fruits',
    title: <>The whole harvest,<br /><em className="font-semibold text-[#efc87e]">in one place.</em></>,
    intro: 'Browse every jar, nut and dried fruit we make — small batches, honest ingredients and careful, fresh packing.',
    roomLabel: 'The full pantry',
    roomTitle: 'Everything we make',
    roomIntro: 'Raw honey, premium nuts and sun-dried fruits, all in one place.',
    allLabel: 'All products',
    heading: 'All products',
    sizeLabel: 'Pack size',
    note: { title: 'Honest ingredients', body: 'No artificial flavouring, colour or refined sugar — ever.' },
    emptyTitle: 'Nothing matches those filters',
  },
}

/** Until the category tree arrives, guess the theme from the slug to avoid a hero flash. */
const guessTheme = (slug?: string): CatalogTheme =>
  !slug ? 'all' : /honey|comb|gift/.test(slug) ? 'honey' : 'dry-fruits'

/** "250g" → 250, "1kg" → 1000; unknown formats sort last. */
const gramsOf = (size: string) => {
  const match = /([\d.]+)\s*(kg|g)\b/i.exec(size)
  if (!match || /×|x\s*\d/i.test(size)) return Number.MAX_SAFE_INTEGER
  return Number(match[1]) * (match[2].toLowerCase() === 'kg' ? 1000 : 1)
}

const categoryOptions = (tree: Category[] | undefined, match: CategoryMatch | null, allLabel: string): CategoryOption[] => {
  if (!tree) return []
  const visible = (_category: Category) => true
  if (!match) {
    return [
      { slug: '', name: allLabel, depth: 0 },
      ...tree.filter(visible).flatMap((root) => [
        { slug: root.slug, name: root.name, depth: 0 },
        ...root.children.filter(visible).map((child) => ({ slug: child.slug, name: child.name, depth: 1 })),
      ]),
    ]
  }
  const root = match.parent ?? match.category
  return [{ slug: root.slug, name: allLabel, depth: 0 }, ...root.children.filter(visible).map((child) => ({ slug: child.slug, name: child.name, depth: 0 }))]
}

const toQuery = (filters: CatalogFilters, sort: ProductSort): ProductQuery => ({
  search: filters.search.trim() || undefined,
  category: filters.category || undefined,
  minPrice: filters.minPrice ?? undefined,
  maxPrice: filters.maxPrice ?? undefined,
  sizes: filters.sizes.length ? [...filters.sizes].sort() : undefined,
  minRating: filters.minRating || undefined,
  sort,
  limit: PAGE_SIZE,
})

const sameFilters = (a: CatalogFilters, b: CatalogFilters) => JSON.stringify(a) === JSON.stringify(b)

function CatalogLoading({ cards = 6 }: { cards?: number }) {
  return (
    <div className="catalog-loading" role="status" aria-live="polite" aria-label="Loading products">
      <div className="catalog-loading-message"><span className="loading-honey-drop" /><div><strong>Finding your perfect harvest</strong><small>Fetching the collection…</small></div></div>
      <div className="loading-card-grid" aria-hidden="true">
        {Array.from({ length: cards }, (_, index) => <CatalogCardSkeleton key={index} />)}
      </div>
    </div>
  )
}

/** Pages 2..n of the result list; each page fetches (and caches) itself. */
function MoreResults({ query, page, renderCard }: { query: ProductQuery; page: number; renderCard: (product: ProductSummary) => ReactNode }) {
  const { data, isFetching, isError } = useGetProductsQuery({ ...query, page })
  if (isError && !data) return null
  if (!data || isFetching) return <>{Array.from({ length: 3 }, (_, index) => <CatalogCardSkeleton key={`more-${page}-${index}`} />)}</>
  return <>{data.data.map(renderCard)}</>
}

export function CategoryPage({ category }: { category?: string }) {
  const route = useRoute()
  const search = route.query.get('search') ?? ''
  // A new collection or search term starts from fresh filters.
  return <CatalogView key={`${category ?? ''}|${search}`} baseSlug={category} initialSearch={search} />
}

function CatalogView({ baseSlug, initialSearch }: { baseSlug?: string; initialSearch: string }) {
  const { data: tree, isError: treeError } = useGetCategoriesQuery()
  const match = findCategory(tree, baseSlug)
  const notFound = Boolean(baseSlug && tree && !match)
  const theme = tree ? themeOf(match) : guessTheme(baseSlug)
  const copy = THEMES[theme]

  const defaults = useMemo<CatalogFilters>(
    () => ({ search: initialSearch, category: baseSlug ?? '', minPrice: null, maxPrice: null, sizes: [], minRating: 0 }),
    [initialSearch, baseSlug],
  )
  const [draft, setDraft] = useState(defaults)
  const [applied, setApplied] = useState(defaults)
  const [sort, setSort] = useState<ProductSort>('featured')
  const [view, setView] = useState<ViewMode>('grid')
  const [pages, setPages] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)

  const query = useMemo(() => toQuery(applied, sort), [applied, sort])
  const first = useGetProductsQuery({ ...query, page: 1 }, { skip: notFound })
  const last = useGetProductsQuery({ ...query, page: pages }, { skip: notFound || pages === 1 })
  // Facets (sizes, price ceiling) come from the whole collection, not the filtered result.
  const facets = useGetProductsQuery({ category: (match?.parent ?? match?.category)?.slug ?? baseSlug, limit: 50 }, { skip: notFound })

  const { quickAdd, isAdding } = useQuickAdd()
  const { isWished, toggle } = useWishlist()

  const sizeOptions = useMemo(
    () => Array.from(new Set((facets.data?.data ?? []).flatMap((product) => product.sizes))).sort((a, b) => gramsOf(a) - gramsOf(b) || a.localeCompare(b)),
    [facets.data],
  )
  const priceCeiling = useMemo(() => {
    const highest = Math.max(0, ...(facets.data?.data ?? []).map((product) => product.price))
    return highest ? Math.ceil(highest / 100) * 100 : 2000
  }, [facets.data])
  const options = useMemo(() => categoryOptions(tree, match, copy.allLabel), [tree, match, copy.allLabel])

  const result = first.currentData
  const total = result?.meta.total ?? 0
  const totalPages = result?.meta.totalPages ?? 1
  const loaded = Math.min(pages * PAGE_SIZE, total)
  const applying = first.isFetching && !first.currentData
  const loadingMore = pages > 1 && last.isFetching
  const dirty = !sameFilters(draft, applied)
  const appliedMatch = findCategory(tree, applied.category)
  const heading = appliedMatch?.parent ? appliedMatch.category.name : THEMES[themeOf(appliedMatch)].heading

  const applyFilters = () => {
    if (draft.minPrice !== null && draft.maxPrice !== null && draft.minPrice > draft.maxPrice) {
      toast.error('Check the price range', { description: 'The minimum price must be below the maximum.' })
      return
    }
    setApplied(draft)
    setPages(1)
    setFilterOpen(false)
  }
  const clear = () => {
    const cleared = { ...defaults, search: '' }
    setDraft(cleared)
    setApplied(cleared)
    setPages(1)
  }

  const renderCard = (product: ProductSummary) => (
    <CatalogProductCard
      key={product.id}
      product={product}
      view={view}
      wished={isWished(product.id)}
      adding={isAdding(product.id)}
      onWish={() => toggle(product)}
      onAdd={() => quickAdd(product)}
    />
  )

  const panelProps = {
    draft,
    onChange: (patch: Partial<CatalogFilters>) => setDraft((current) => ({ ...current, ...patch })),
    categories: options,
    sizeOptions,
    priceCeiling,
    sizeLabel: copy.sizeLabel,
    note: copy.note,
    dirty,
    applying,
    onApply: applyFilters,
    onClear: clear,
  }

  const breadcrumb = [
    { label: 'Home', href: '#home' },
    { label: 'Shop', href: '#shop' },
    ...(match?.parent ? [{ label: match.parent.name, href: `#shop/${match.parent.slug}` }] : []),
    ...(match ? [{ label: match.category.name, href: undefined }] : []),
  ]
  if (!match) breadcrumb[breadcrumb.length - 1].href = undefined

  let results: ReactNode
  if (notFound) {
    results = (
      <div className="catalog-empty">
        <Minus size={24} />
        <h3>We couldn’t find that collection</h3>
        <p>It may have moved. Browse the full shop instead.</p>
        <a className="catalog-empty-action" href="#shop">Browse all products</a>
      </div>
    )
  } else if (first.isError && !result) {
    results = (
      <div className="catalog-empty" role="alert">
        <AlertCircle size={24} />
        <h3>We couldn’t load the collection</h3>
        <p>{errorMessage(first.error)}</p>
        <button type="button" onClick={() => first.refetch()}><RotateCcw size={12} className="mr-1 inline" /> Try again</button>
      </div>
    )
  } else if (!result) {
    results = <CatalogLoading />
  } else if (!result.data.length) {
    results = (
      <div className="catalog-empty">
        <Minus size={24} />
        <h3>{copy.emptyTitle}</h3>
        <p>{applied.search ? `No results for “${applied.search}”. Try a different word or widen your filters.` : 'Try widening your price or removing a size.'}</p>
        <button type="button" onClick={clear}>Reset filters</button>
      </div>
    )
  } else {
    results = (
      <>
        <div className={`product-catalog-grid ${view === 'list' ? 'is-list' : ''}`} aria-busy={first.isFetching}>
          {result.data.map(renderCard)}
          {Array.from({ length: pages - 1 }, (_, index) => <MoreResults key={index + 2} query={query} page={index + 2} renderCard={renderCard} />)}
        </div>
        {pages < totalPages && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-[11px] text-stone-500 dark:text-stone-400">Showing {loaded} of {total} products</p>
            <span className="catalog-progress" aria-hidden="true"><i style={{ width: `${(loaded / total) * 100}%` }} /></span>
            <button className="catalog-load-more" type="button" onClick={() => setPages((value) => value + 1)} disabled={loadingMore}>
              {loadingMore ? <><Loader2 className="animate-spin" size={14} /> Loading…</> : 'Load more'}
            </button>
          </div>
        )}
      </>
    )
  }

  return (
    <main id="catalog-page" className="catalog-page">
      <section className="category-hero">
        <div className="category-hero-image" style={{ backgroundImage: `url("${copy.image}")` }} aria-hidden="true" />
        <div className="category-hero-glow" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex min-h-[430px] max-w-[1440px] items-center px-5 py-16 sm:px-8 lg:px-14">
          <div className="max-w-[660px] category-hero-copy">
            <nav className="mb-6 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[.16em] text-[#eed6aa]" aria-label="Breadcrumb">
              {breadcrumb.map((item, index) => (
                <span className="flex items-center gap-2" key={item.label}>
                  {index > 0 && <span aria-hidden="true">/</span>}
                  {item.href ? <a className="hover:text-white" href={item.href}>{item.label}</a> : <span className="text-white" aria-current="page">{item.label}</span>}
                </span>
              ))}
            </nav>
            {initialSearch ? (
              <>
                <span className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.22em] text-[#e8bd71]"><Sparkles size={13} /> Search results</span>
                <h1 className="font-display text-[3.2rem] font-bold leading-[.94] tracking-[-.025em] text-white sm:text-[4.8rem]">Results for<br /><em className="break-words font-semibold text-[#efc87e]">“{initialSearch}”</em></h1>
                <p className="mt-6 max-w-[570px] text-sm leading-7 text-white/75 sm:text-base">{result ? `${total} product${total === 1 ? '' : 's'} found${match ? ` in ${match.category.name}` : ''}.` : 'Searching the pantry…'}</p>
              </>
            ) : (
              <>
                <span className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.22em] text-[#e8bd71]"><Sparkles size={13} /> {match?.parent ? match.category.name : copy.eyebrow}</span>
                <h1 className="font-display text-[3.2rem] font-bold leading-[.94] tracking-[-.025em] text-white sm:text-[4.8rem]">{copy.title}</h1>
                <p className="mt-6 max-w-[570px] text-sm leading-7 text-white/75 sm:text-base">{(match?.parent && match.category.description) || copy.intro}</p>
              </>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-5 text-[10px] font-semibold uppercase tracking-[.12em] text-white/75"><span className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#e8bd71]" /> Lab tested</span><span className="hidden h-4 w-px bg-white/20 sm:block" /><span className="flex items-center gap-2"><PackageCheck size={16} className="text-[#e8bd71]" /> Freshly packed</span><span className="hidden h-4 w-px bg-white/20 sm:block" /><span className="flex items-center gap-2"><Truck size={16} className="text-[#e8bd71]" /> Free over ₹999</span></div>
          </div>
        </div>
        <a className="hero-scroll-cue" href="#catalog" onClick={(event) => { event.preventDefault(); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }) }} aria-label="Scroll to collection"><span>Explore the harvest</span><ChevronDown size={16} /></a>
      </section>

      <section className="catalog-section" id="catalog">
        <div className="catalog-orb catalog-orb-one" aria-hidden="true" /><div className="catalog-orb catalog-orb-two" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-14 lg:py-24">
          <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div><span className="eyebrow flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#a46a2a]">{copy.roomLabel}</span><h2 className="mt-3 font-display text-4xl font-bold text-[#193f32] dark:text-stone-50 sm:text-5xl">{copy.roomTitle}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-stone-500 dark:text-stone-400">{copy.roomIntro}</p></div>
            <div className="hidden items-center gap-2 text-[11px] text-stone-500 md:flex"><Info size={14} className="text-[#a46a2a]" /> Hover over icons for helpful details</div>
          </div>

          <div className="catalog-toolbar">
            <div className="min-w-0">
              <b className="font-display text-xl text-[#244538] dark:text-stone-100">{heading}</b>
              <span className="ml-2 text-[11px] text-stone-400" aria-live="polite">{result ? `${loaded} of ${total} product${total === 1 ? '' : 's'}` : treeError ? '' : 'Loading…'}</span>
              {applied.search && <button className="catalog-active-chip" type="button" onClick={() => { const next = { ...applied, search: '' }; setDraft(next); setApplied(next); setPages(1) }} aria-label={`Clear search ${applied.search}`}>“{applied.search}” <X size={11} /></button>}
            </div>
            <div className="flex items-center gap-2">
              <button className="mobile-filter-button" type="button" onClick={() => setFilterOpen(true)} aria-haspopup="dialog"><Filter size={14} /> Filters{dirty ? ' •' : ''}</button>
              <label className="sort-control"><span>Sort</span><select value={sort} onChange={(event) => { setSort(event.target.value as ProductSort); setPages(1) }} aria-label="Sort products">{SORTS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><ChevronDown size={13} /></label>
              <div className="view-switch" role="group" aria-label="View mode"><Tooltip label="Grid view"><button className={view === 'grid' ? 'is-active' : ''} onClick={() => setView('grid')} aria-label="Grid view" aria-pressed={view === 'grid'} type="button"><Grid2X2 size={15} /></button></Tooltip><Tooltip label="List view"><button className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')} aria-label="List view" aria-pressed={view === 'list'} type="button"><LayoutList size={16} /></button></Tooltip></div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[245px_1fr] xl:grid-cols-[265px_1fr]">
            <aside className="catalog-filter" aria-label="Product filters"><FilterPanel idPrefix="desktop" {...panelProps} /></aside>
            <div className="catalog-results-shell">
              {results}
            </div>
          </div>
        </div>
      </section>

      <StatsBand />
      <NewsletterSection />

      {filterOpen && (
        <div className="filter-drawer-backdrop" role="presentation" onClick={() => setFilterOpen(false)} onKeyDown={(event) => event.key === 'Escape' && setFilterOpen(false)}>
          <aside className="filter-drawer" role="dialog" aria-modal="true" aria-label="Product filters" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><b className="font-display text-2xl text-[#193f32] dark:text-stone-100">Refine your harvest</b><button className="icon-button" type="button" onClick={() => setFilterOpen(false)} aria-label="Close filters" autoFocus><X size={19} /></button></div>
            <FilterPanel idPrefix="mobile" {...panelProps} />
          </aside>
        </div>
      )}
      <Footer />
    </main>
  )
}
