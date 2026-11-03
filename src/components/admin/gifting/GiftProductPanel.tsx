import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { useGetAdminProductQuery, useGetAdminProductsQuery } from '../../../features/admin/adminApi'
import { formatMoney } from '../../../utils/format'
import { btn, input, label as labelClass } from '../styles'

const MAX_INCLUDED = 12

/**
 * Shop products a gift contains, shown on the gift page as "Includes …".
 * Display only: the gift is sold at its own price, whatever is listed here.
 */
export function IncludedProductsField({ productIds, onChange }: { productIds: string[]; onChange: (productIds: string[]) => void }) {
  const move = (index: number, by: number) => {
    const next = [...productIds]
    ;[next[index], next[index + by]] = [next[index + by], next[index]]
    onChange(next)
  }
  return (
    <div className="grid gap-3">
      <div>
        <p className={labelClass}>Products included (optional)</p>
        <p className="text-[11px] text-stone-500">Shown under the gift as “Includes …”. They don’t change the gift price.</p>
      </div>
      {productIds.length > 0 && (
        <ul className="grid gap-2">
          {productIds.map((id, index) => (
            <IncludedProduct
              key={id}
              productId={id}
              onUp={index > 0 ? () => move(index, -1) : undefined}
              onDown={index < productIds.length - 1 ? () => move(index, 1) : undefined}
              onRemove={() => onChange(productIds.filter((other) => other !== id))}
            />
          ))}
        </ul>
      )}
      {productIds.length < MAX_INCLUDED && <AddExisting exclude={productIds} onAdd={(id) => onChange([...productIds, id])} />}
    </div>
  )
}

function IncludedProduct({ productId, onUp, onDown, onRemove }: { productId: string; onUp?: () => void; onDown?: () => void; onRemove: () => void }) {
  const { data: product } = useGetAdminProductQuery(productId)
  return (
    <li className="flex items-center gap-3 rounded-xl bg-white p-2 ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-700">
      <span className="size-9 shrink-0 overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800">
        {product?.images[0] && <img src={product.images[0].thumbUrl} alt="" className="size-full object-cover" />}
      </span>
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-stone-800 dark:text-stone-100">
        {product?.name ?? 'Loading…'}
        {product && !product.isActive && <span className="ml-2 text-xs font-bold text-amber-700">(hidden in store — not listed)</span>}
      </p>
      <button type="button" className={`${btn.icon} size-8`} onClick={onUp} disabled={!onUp} aria-label="Move up"><ArrowUp size={14} /></button>
      <button type="button" className={`${btn.icon} size-8`} onClick={onDown} disabled={!onDown} aria-label="Move down"><ArrowDown size={14} /></button>
      <button type="button" className={`${btn.icon} size-8 hover:text-rose-600`} onClick={onRemove} aria-label="Remove"><X size={14} /></button>
    </li>
  )
}

function AddExisting({ exclude, onAdd }: { exclude: string[]; onAdd: (id: string) => void }) {
  const [search, setSearch] = useState('')
  const [choice, setChoice] = useState('')
  const { data, isFetching } = useGetAdminProductsQuery({ search: search.trim() || undefined, limit: 50, sort: 'name', isActive: true })
  // Gift products themselves (hidden "Gift collections" category) can't be listed as contents.
  const options = (data?.data ?? []).filter((product) => !exclude.includes(product.id) && product.category.name !== 'Gift collections')
  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
      <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products…" aria-label="Search products" className={input} />
      <select value={choice} onChange={(event) => setChoice(event.target.value)} aria-label="Product to include" className={input}>
        <option value="">{isFetching ? 'Searching…' : 'Choose a product…'}</option>
        {options.map((product) => <option key={product.id} value={product.id}>{product.name} · {formatMoney(product.price)}</option>)}
      </select>
      <button type="button" className={btn.smallPrimary} disabled={!choice} onClick={() => { onAdd(choice); setChoice('') }}>
        <Plus size={13} /> Add
      </button>
    </div>
  )
}
