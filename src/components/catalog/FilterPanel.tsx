import { Check, Leaf, Search, SlidersHorizontal, Star } from 'lucide-react'
import { formatMoney } from '../../utils/format'

export type CatalogFilters = {
  search: string
  /** Category slug; '' = everything in the current collection. */
  category: string
  minPrice: number | null
  maxPrice: number | null
  sizes: string[]
  /** 0 = any rating. */
  minRating: number
}

export type CategoryOption = { slug: string; name: string; depth: number }

type FilterPanelProps = {
  idPrefix: string
  draft: CatalogFilters
  onChange: (patch: Partial<CatalogFilters>) => void
  categories: CategoryOption[]
  sizeOptions: string[]
  priceCeiling: number
  sizeLabel: string
  note: { title: string; body: string }
  dirty: boolean
  applying: boolean
  onApply: () => void
  onClear: () => void
}

const RATINGS = [4.5, 4, 3, 0]

export function FilterPanel({ idPrefix, draft, onChange, categories, sizeOptions, priceCeiling, sizeLabel, note, dirty, applying, onApply, onClear }: FilterPanelProps) {
  const id = (name: string) => `${idPrefix}-${name}`
  const maxPrice = draft.maxPrice ?? priceCeiling
  const toggleSize = (size: string) => onChange({ sizes: draft.sizes.includes(size) ? draft.sizes.filter((item) => item !== size) : [...draft.sizes, size] })
  const priceNumber = (value: string) => (value === '' ? null : Math.max(0, Math.round(Number(value))))

  return (
    <form className="catalog-filter-inner" onSubmit={(event) => { event.preventDefault(); onApply() }}>
      <div className="filter-panel-heading"><div><SlidersHorizontal size={16} /> Filters</div><button className="filter-clear" type="button" onClick={onClear}>Clear all</button></div>

      <div className="filter-group">
        <label className="filter-label" htmlFor={id('search')}>Search collection</label>
        <div className="filter-search"><Search size={14} aria-hidden="true" /><input id={id('search')} type="search" placeholder="Wildflower, almonds…" value={draft.search} onChange={(event) => onChange({ search: event.target.value })} maxLength={100} /></div>
        <p className="filter-help">Results update after you select <strong>Apply filters</strong>.</p>
      </div>

      <div className="filter-group">
        <div className="flex items-center justify-between"><span className="filter-label" id={id('price-label')}>Price range</span><span className="catalog-chip">Up to {formatMoney(maxPrice)}</span></div>
        <input className="price-slider mt-4 w-full" type="range" min={0} max={priceCeiling} step={50} value={Math.min(maxPrice, priceCeiling)} onChange={(event) => { const value = Number(event.target.value); onChange({ maxPrice: value >= priceCeiling ? null : value }) }} aria-labelledby={id('price-label')} aria-valuetext={`Up to ${formatMoney(maxPrice)}`} />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="catalog-price-input"><span>Min ₹</span><input type="number" inputMode="numeric" min={0} placeholder="0" value={draft.minPrice ?? ''} onChange={(event) => onChange({ minPrice: priceNumber(event.target.value) })} aria-label="Minimum price in rupees" /></label>
          <label className="catalog-price-input"><span>Max ₹</span><input type="number" inputMode="numeric" min={0} placeholder={String(priceCeiling)} value={draft.maxPrice ?? ''} onChange={(event) => onChange({ maxPrice: priceNumber(event.target.value) })} aria-label="Maximum price in rupees" /></label>
        </div>
        {draft.minPrice !== null && draft.maxPrice !== null && draft.minPrice > draft.maxPrice && <p className="mt-2 text-[10px] font-semibold text-[#b94738]" role="alert">Minimum price is above the maximum.</p>}
      </div>

      {categories.length > 1 && (
        <fieldset className="filter-group">
          <legend className="filter-label">Category</legend>
          <div className="mt-3 space-y-2.5">
            {categories.map((item) => (
              <label className="filter-check" key={item.slug || 'all'} style={{ paddingLeft: item.depth ? `${item.depth * 0.9}rem` : undefined }}>
                <input type="radio" name={id('category')} checked={draft.category === item.slug} onChange={() => onChange({ category: item.slug })} />
                <span className="fake-check">{draft.category === item.slug && <Check size={10} />}</span>{item.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="filter-group">
        <legend className="filter-label">Customer rating</legend>
        <div className="mt-3 space-y-2.5">
          {RATINGS.map((rating) => (
            <label className="filter-check" key={rating}>
              <input type="radio" name={id('rating')} checked={draft.minRating === rating} onChange={() => onChange({ minRating: rating })} />
              <span className="fake-radio" />
              {rating ? <span className="flex items-center gap-1.5 text-[#d6941a]"><Star size={12} fill="currentColor" aria-hidden="true" /> <b className="text-xs font-semibold text-stone-700 dark:text-stone-200">{rating} &amp; up</b></span> : <b className="text-xs font-semibold text-stone-700 dark:text-stone-200">Any rating</b>}
            </label>
          ))}
        </div>
      </fieldset>

      {sizeOptions.length > 0 && (
        <fieldset className="filter-group">
          <legend className="filter-label">{sizeLabel}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizeOptions.map((size) => <button className={`size-filter ${draft.sizes.includes(size) ? 'is-active' : ''}`} type="button" key={size} aria-pressed={draft.sizes.includes(size)} onClick={() => toggleSize(size)}>{size}</button>)}
          </div>
        </fieldset>
      )}

      <div className="filter-note"><span><Leaf size={14} /> {note.title}</span>{note.body}</div>
      <button className={`filter-apply ${dirty ? 'is-dirty' : ''}`} type="submit" disabled={applying}>
        {applying ? <><span className="filter-spinner" /> Applying filters…</> : <><SlidersHorizontal size={13} /> Apply filters</>}
      </button>
    </form>
  )
}
