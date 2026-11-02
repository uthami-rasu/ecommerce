import { Package, Plus, Trash2 } from 'lucide-react'
import { card } from './styles'
import { emptyVariant, type VariantRow } from './variants'

const cell =
  'w-full rounded-lg border-0 bg-stone-50/70 px-2.5 py-2 text-sm text-stone-800 ring-1 ring-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#24412a]/50 dark:bg-stone-850 dark:text-stone-100 dark:ring-stone-700'

/** Sizes / packs with their own price, MRP and stock — the price customers pay depends on the size picked. */
export function VariantsEditor({ rows, onChange }: { rows: VariantRow[]; onChange: (rows: VariantRow[]) => void }) {
  const update = (index: number, patch: Partial<VariantRow>) =>
    onChange(rows.map((row, position) => (position === index ? { ...row, ...patch } : row)))

  return (
    <div className={`${card} space-y-4 p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Package size={16} />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100">Variants, prices &amp; stock</h2>
            <p className="text-[11px] text-stone-400">Each size has its own price. MRP is optional (shown struck through when higher than the price).</p>
          </div>
        </div>
        <button type="button" onClick={() => onChange([...rows, emptyVariant()])} className="inline-flex items-center gap-1 rounded-lg bg-[#24412a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2d5034]">
          <Plus size={13} /> Add variant
        </button>
      </div>

      <div className="hidden grid-cols-[1.2fr_1fr_1fr_0.8fr_auto_auto] gap-3 px-1 text-[11px] font-semibold uppercase tracking-wide text-stone-400 md:grid">
        <span>Size / pack</span>
        <span>Price (₹) *</span>
        <span>MRP (₹)</span>
        <span>Stock *</span>
        <span>On sale</span>
        <span className="w-8" />
      </div>

      <ul className="grid gap-3">
        {rows.map((row, index) => {
          const price = Number(row.price)
          const mrp = Number(row.compareAtPrice)
          const off = row.compareAtPrice && mrp > price && price > 0 ? Math.round((1 - price / mrp) * 100) : 0
          return (
            <li key={row.id ?? `new-${index}`} className="grid grid-cols-2 gap-3 rounded-xl bg-stone-50/60 p-3 ring-1 ring-stone-200/70 md:grid-cols-[1.2fr_1fr_1fr_0.8fr_auto_auto] md:items-center md:bg-transparent md:p-1 md:ring-0 dark:bg-stone-900/40">
              <label className="col-span-2 md:col-span-1">
                <span className="mb-1 block text-[11px] font-semibold text-stone-500 md:sr-only">Size / pack</span>
                <input value={row.label} maxLength={40} placeholder="e.g. 250g" onChange={(event) => update(index, { label: event.target.value })} className={cell} />
              </label>
              <label>
                <span className="mb-1 block text-[11px] font-semibold text-stone-500 md:sr-only">Price (₹)</span>
                <input type="number" min={0} step="0.01" inputMode="decimal" value={row.price} placeholder="0.00" onChange={(event) => update(index, { price: event.target.value })} className={cell} />
              </label>
              <label>
                <span className="mb-1 block text-[11px] font-semibold text-stone-500 md:sr-only">MRP (₹)</span>
                <input type="number" min={0} step="0.01" inputMode="decimal" value={row.compareAtPrice} placeholder="Optional" onChange={(event) => update(index, { compareAtPrice: event.target.value })} className={cell} />
                {off > 0 && <span className="mt-0.5 block text-[10px] font-semibold text-emerald-600">{off}% off</span>}
              </label>
              <label>
                <span className="mb-1 block text-[11px] font-semibold text-stone-500 md:sr-only">Stock</span>
                <input type="number" min={0} step="1" inputMode="numeric" value={row.stock} placeholder="0" onChange={(event) => update(index, { stock: event.target.value })} className={cell} />
              </label>
              <label className="flex items-center gap-2 text-xs text-stone-600 md:justify-center">
                <input type="checkbox" checked={row.isActive} onChange={(event) => update(index, { isActive: event.target.checked })} className="size-4 accent-[#24412a]" />
                <span className="md:sr-only">On sale</span>
              </label>
              <button
                type="button"
                onClick={() => onChange(rows.filter((_, position) => position !== index))}
                disabled={rows.length === 1}
                aria-label={`Remove ${row.label || `variant ${index + 1}`}`}
                title={rows.length === 1 ? 'A product needs at least one variant' : 'Remove'}
                className="grid size-8 place-items-center justify-self-end rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <Trash2 size={15} />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
