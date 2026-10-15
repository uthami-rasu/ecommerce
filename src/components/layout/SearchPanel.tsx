import { ArrowUpRight, CornerDownLeft, Leaf, Loader2, Search, SearchX, TrendingUp, X } from 'lucide-react'
import { useId, useMemo, useState, type KeyboardEvent } from 'react'
import { useDebouncedValue } from '../catalog/useDebouncedValue'
import { useGetProductsQuery, useSearchSuggestionsQuery, type ProductSuggestion } from '../../features/catalog/catalogApi'
import { formatMoney } from '../../utils/format'
import { navigate } from '../../utils/router'

type SearchPanelProps = {
  onClose: () => void
}

const POPULAR_SEARCHES = ['Almonds', 'Raw honey', 'Trail mix', 'Dried figs', 'Cashews']
const LIMIT = 8

type Item = ProductSuggestion & { imageUrl: string | null }

export function SearchPanel({ onClose }: SearchPanelProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const listId = useId()
  const term = query.trim()
  const debounced = useDebouncedValue(term, 250)
  const hasQuery = term.length > 0

  const suggestions = useSearchSuggestionsQuery({ q: debounced, limit: LIMIT }, { skip: !debounced })
  const quickPicks = useGetProductsQuery({ featured: true, limit: 4 })

  const items = useMemo<Item[]>(() => {
    if (hasQuery) return (suggestions.currentData ?? []).map((item) => ({ ...item, imageUrl: item.thumbUrl }))
    return (quickPicks.data?.data ?? []).map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category.name,
      price: product.price,
      thumbUrl: product.image?.thumbUrl ?? null,
      imageUrl: product.image?.mediumUrl ?? null,
    }))
  }, [hasQuery, suggestions.currentData, quickPicks.data])

  const searching = hasQuery && (term !== debounced || suggestions.isFetching || (!suggestions.currentData && !suggestions.isError))
  const loading = hasQuery ? searching : quickPicks.isLoading
  // Results + the trailing "view all" row are navigable with the arrow keys.
  const navigableCount = hasQuery && !searching ? items.length + 1 : items.length

  const openProduct = (slug: string) => {
    onClose()
    navigate(`product/${slug}`)
  }
  const viewAll = () => {
    onClose()
    navigate('shop', { query: { search: term || undefined } })
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!navigableCount) return
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((current) => {
        const next = current + step
        if (next < -1) return navigableCount - 1
        if (next >= navigableCount) return -1
        return next
      })
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (activeIndex >= 0 && activeIndex < items.length && !searching) openProduct(items[activeIndex].slug)
      else if (term) viewAll()
    }
  }

  const optionId = (index: number) => `${listId}-option-${index}`
  const viewAllIndex = items.length
  const activeDescendant = activeIndex >= 0 && activeIndex < navigableCount ? optionId(activeIndex) : undefined

  return (
    <div className="search-backdrop fixed inset-0 z-[80] bg-[#10281f]/45 px-3 pt-3 backdrop-blur-md sm:px-6 sm:pt-16" role="dialog" aria-modal="true" aria-label="Search products" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="search-panel mx-auto max-w-[860px] overflow-hidden rounded-[28px] border border-white/60 bg-[#fffdf8] shadow-[0_30px_100px_rgba(15,35,27,.3)] dark:border-stone-700 dark:bg-stone-950">
        <div className="flex items-center gap-3 border-b border-[#e9e2d7] px-5 py-4 dark:border-stone-800 sm:px-7">
          {searching ? <Loader2 className="animate-spin text-[#557565]" size={21} aria-hidden="true" /> : <Search className="text-[#557565]" size={21} aria-hidden="true" />}
          <input
            autoFocus
            className="h-11 min-w-0 flex-1 bg-transparent text-base text-stone-900 outline-none placeholder:text-stone-400 dark:text-white"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setActiveIndex(-1) }}
            onKeyDown={onKeyDown}
            placeholder="Search almonds, honey, hampers…"
            type="text"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            maxLength={100}
            role="combobox"
            aria-label="Search products"
            aria-expanded={items.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeDescendant}
          />
          <kbd className="hidden rounded-md border border-stone-200 bg-white px-2 py-1 text-[10px] text-stone-400 dark:border-stone-700 dark:bg-stone-900 sm:block">ESC</kbd>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close search"><X size={19} /></button>
        </div>

        <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-[180px_1fr]">
          <aside>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">Popular searches</p>
            <div className="mt-3 flex flex-wrap gap-2 md:flex-col md:items-start">
              {POPULAR_SEARCHES.map((popular) => (
                <button className="group flex items-center gap-2 rounded-full bg-[#f4efe5] px-3 py-2 text-xs font-semibold text-[#315545] transition hover:bg-[#e7dbc6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9B27C] dark:bg-stone-900 dark:text-stone-200 md:bg-transparent md:px-0 md:hover:bg-transparent md:hover:text-[#a8682f] md:dark:bg-transparent" key={popular} type="button" onClick={() => { setQuery(popular); setActiveIndex(-1) }}>
                  <TrendingUp size={13} /> {popular}
                </button>
              ))}
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400" aria-live="polite">
                {hasQuery ? (searching ? 'Searching…' : `${items.length} match${items.length === 1 ? '' : 'es'}`) : 'Quick picks'}
              </p>
              <a className="flex items-center gap-1 rounded-full text-xs font-bold text-[#315545] hover:text-[#a8682f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9B27C] dark:text-[#e7c88d]" href={term ? `#shop?search=${encodeURIComponent(term)}` : '#shop'} onClick={(event) => { event.preventDefault(); viewAll() }}>
                {term ? 'View all results' : 'Shop all'} <ArrowUpRight size={13} />
              </a>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-hidden="true">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index}><span className="catalog-skeleton block aspect-square rounded-2xl" /><span className="catalog-skeleton mt-2 block h-2.5 w-4/5 rounded-full" /><span className="catalog-skeleton mt-1.5 block h-2.5 w-10 rounded-full" /></div>
                ))}
              </div>
            ) : hasQuery && suggestions.isError ? (
              <div className="grid min-h-40 place-items-center rounded-2xl border border-dashed border-stone-300 px-4 text-center text-sm text-stone-500 dark:border-stone-700" role="alert">Search is unavailable right now. Please try again.</div>
            ) : items.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="listbox" id={listId} aria-label={hasQuery ? 'Search suggestions' : 'Quick picks'}>
                {items.map((item, index) => (
                  <a
                    className={`group rounded-2xl p-1.5 outline-none transition ${activeIndex === index ? 'bg-[#f4efe5] ring-2 ring-[#D9B27C] dark:bg-stone-900' : 'hover:bg-[#f8f4ec] dark:hover:bg-stone-900'}`}
                    href={`#product/${item.slug}`}
                    key={item.id}
                    id={optionId(index)}
                    role="option"
                    aria-selected={activeIndex === index}
                    onClick={(event) => { event.preventDefault(); openProduct(item.slug) }}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <div className="grid aspect-square place-items-center overflow-hidden rounded-xl bg-[#f2ece2] text-[#b59a6e] dark:bg-stone-800">
                      {item.imageUrl ? <img className="h-full w-full object-cover transition duration-500 group-hover:scale-110" src={item.imageUrl} alt="" width={200} height={200} loading="lazy" /> : <Leaf size={24} aria-hidden="true" />}
                    </div>
                    <p className="mt-2 line-clamp-1 text-xs font-semibold text-stone-800 dark:text-white">{item.name}</p>
                    <p className="mt-0.5 flex items-center justify-between gap-2 text-xs"><b className="font-bold text-[#a36932] dark:text-[#e7c88d]">{formatMoney(item.price)}</b><span className="truncate text-[10px] text-stone-400">{item.category}</span></p>
                  </a>
                ))}
                {hasQuery && (
                  <a
                    className={`col-span-2 flex items-center justify-between gap-3 rounded-2xl border border-dashed px-4 py-3 text-xs font-bold outline-none transition sm:col-span-4 ${activeIndex === viewAllIndex ? 'border-[#D9B27C] bg-[#f4efe5] text-[#173f32] dark:bg-stone-900 dark:text-stone-100' : 'border-stone-300 text-[#315545] hover:border-[#D9B27C] dark:border-stone-700 dark:text-stone-300'}`}
                    href={`#shop?search=${encodeURIComponent(term)}`}
                    id={optionId(viewAllIndex)}
                    role="option"
                    aria-selected={activeIndex === viewAllIndex}
                    onClick={(event) => { event.preventDefault(); viewAll() }}
                    onMouseEnter={() => setActiveIndex(viewAllIndex)}
                  >
                    <span>See every result for “{term}”</span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-stone-400"><CornerDownLeft size={12} /> Enter</span>
                  </a>
                )}
              </div>
            ) : (
              <div className="grid min-h-40 place-items-center gap-2 rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
                <SearchX size={22} className="text-stone-400" aria-hidden="true" />
                {hasQuery ? <span>No matches for “{term}”. Try “almonds” or “honey”.</span> : <span>Start typing to search the pantry.</span>}
              </div>
            )}
            <p className="mt-4 hidden items-center gap-3 text-[10px] text-stone-400 sm:flex"><span><kbd className="rounded border border-stone-200 px-1 dark:border-stone-700">↑</kbd> <kbd className="rounded border border-stone-200 px-1 dark:border-stone-700">↓</kbd> to move</span><span><kbd className="rounded border border-stone-200 px-1 dark:border-stone-700">Enter</kbd> to open</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
