import { ArrowDown, ArrowUp, ExternalLink, PackagePlus, Plus, Save, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAppDispatch } from '../../../app/hooks'
import { adminApi, useCreateAdminProductMutation, useGetAdminCategoriesQuery, useGetAdminProductQuery, useGetAdminProductsQuery } from '../../../features/admin/adminApi'
import { formatMoney } from '../../../utils/format'
import { errorMessage } from '../../../lib/http/apiClient'
import { adminRepository } from '../../../repositories/adminRepository'
import { btn, input, label as labelClass } from '../styles'
import { Spinner } from '../ui'
import { VariantsEditor } from '../VariantsEditor'
import { emptyVariant, syncVariants, toVariantInput, toVariantRow, validateVariants, type VariantRow } from '../variants'

const MAX_GIFTS = 8

/**
 * The gift products a collection offers: reorder, remove, edit each one's price / MRP / stock,
 * add existing products or create a new one. Gifts are normal products, so cart, checkout
 * and Razorpay work unchanged.
 */
export function GiftProductsField({ productIds, collectionTitle, onChange, onCreated }: {
  productIds: string[]
  collectionTitle: string
  onChange: (productIds: string[]) => void
  onCreated: (productId: string) => Promise<void>
}) {
  const [creating, setCreating] = useState(false)
  const move = (index: number, by: number) => {
    const next = [...productIds]
    ;[next[index], next[index + by]] = [next[index + by], next[index]]
    onChange(next)
  }
  return (
    <div className="grid gap-3">
      <p className={labelClass}>Gift products in this collection ({productIds.length}/{MAX_GIFTS}) — customers choose one, then add it to the cart</p>
      {productIds.length === 0 && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">No gift products yet — the Add to cart button is hidden until you add at least one.</p>
      )}
      <ul className="grid gap-2">
        {productIds.map((id, index) => (
          <SelectedGift
            key={id}
            productId={id}
            position={index + 1}
            onUp={index > 0 ? () => move(index, -1) : undefined}
            onDown={index < productIds.length - 1 ? () => move(index, 1) : undefined}
            onRemove={() => onChange(productIds.filter((other) => other !== id))}
          />
        ))}
      </ul>
      {productIds.length < MAX_GIFTS && (
        <div className="grid gap-3 rounded-2xl bg-stone-50 p-3 ring-1 ring-stone-200/80 dark:bg-stone-950/40 dark:ring-stone-800">
          <AddExisting exclude={productIds} onAdd={(id) => onChange([...productIds, id])} />
          {creating ? (
            <CreateGiftProduct collectionTitle={collectionTitle} onCreated={async (id) => { await onCreated(id); setCreating(false) }} onCancel={() => setCreating(false)} />
          ) : (
            <button type="button" className={`${btn.small} justify-self-start`} onClick={() => setCreating(true)}>
              <PackagePlus size={13} /> Create a new gift product
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function SelectedGift({ productId, position, onUp, onDown, onRemove }: {
  productId: string
  position: number
  onUp?: () => void
  onDown?: () => void
  onRemove: () => void
}) {
  const { data: product } = useGetAdminProductQuery(productId)
  const [open, setOpen] = useState(false)
  const from = product?.variants.length ? Math.min(...product.variants.map((v) => v.price)) : null
  return (
    <li className="rounded-2xl bg-white ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-700">
      <div className="flex flex-wrap items-center gap-3 p-3">
        <span className="grid size-7 place-items-center rounded-full bg-stone-100 text-xs font-bold text-stone-600 dark:bg-stone-800">{position}</span>
        <span className="size-10 overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800">
          {product?.images[0] && <img src={product.images[0].thumbUrl} alt="" className="size-full object-cover" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-stone-900 dark:text-stone-50">{product?.name ?? 'Loading…'}</p>
          <p className="text-xs text-stone-500">
            {from !== null ? `from ${formatMoney(from)}` : '—'}
            {product && !product.isActive && <span className="ml-2 font-bold text-amber-700">Hidden in store — not shown</span>}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className={btn.small} onClick={() => setOpen(!open)} aria-expanded={open}>{open ? 'Close' : 'Price & stock'}</button>
          <button type="button" className={`${btn.icon} size-8`} onClick={onUp} disabled={!onUp} aria-label="Move up"><ArrowUp size={14} /></button>
          <button type="button" className={`${btn.icon} size-8`} onClick={onDown} disabled={!onDown} aria-label="Move down"><ArrowDown size={14} /></button>
          <button type="button" className={`${btn.icon} size-8 hover:text-rose-600`} onClick={onRemove} aria-label="Remove from collection"><X size={14} /></button>
        </div>
      </div>
      {open && <div className="border-t border-stone-100 p-3 dark:border-stone-800"><LinkedProduct productId={productId} /></div>}
    </li>
  )
}

function AddExisting({ exclude, onAdd }: { exclude: string[]; onAdd: (id: string) => void }) {
  const [search, setSearch] = useState('')
  const [choice, setChoice] = useState('')
  const { data, isFetching } = useGetAdminProductsQuery({ search: search.trim() || undefined, limit: 50, sort: 'name' })
  const options = (data?.data ?? []).filter((product) => !exclude.includes(product.id))
  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
      <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products…" aria-label="Search products" className={input} />
      <select value={choice} onChange={(event) => setChoice(event.target.value)} aria-label="Product to add" className={input}>
        <option value="">{isFetching ? 'Searching…' : 'Choose an existing product…'}</option>
        {options.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name} · from {formatMoney(product.price)}{product.isActive ? '' : ' (hidden in store)'}
          </option>
        ))}
      </select>
      <button type="button" className={btn.smallPrimary} disabled={!choice} onClick={() => { onAdd(choice); setChoice('') }}>
        <Plus size={13} /> Add
      </button>
    </div>
  )
}

function LinkedProduct({ productId }: { productId: string }) {
  const dispatch = useAppDispatch()
  const { data: product, isLoading } = useGetAdminProductQuery(productId)
  const [rows, setRows] = useState<VariantRow[] | null>(null)
  const [saving, setSaving] = useState(false)
  if (isLoading || !product) return <p className="text-xs text-stone-500">{isLoading ? 'Loading the gift’s prices…' : 'Product not found.'}</p>
  const current = rows ?? [...product.variants].sort((a, b) => a.sortOrder - b.sortOrder).map(toVariantRow)
  const dirty = rows !== null

  const save = async () => {
    const problem = validateVariants(current)
    if (problem) return void toast.error(problem)
    setSaving(true)
    try {
      await syncVariants(adminRepository, productId, product.variants, current)
      dispatch(adminApi.util.invalidateTags([{ type: 'AdminProducts', id: productId }, 'AdminProducts', 'Products', 'GiftPage']))
      setRows(null)
      toast.success(`Prices for “${product.name}” saved`, { description: 'Live on the gift page and at checkout.' })
    } catch (err) {
      toast.error('Prices not saved', { description: errorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
        <span>
          Selling <b className="text-stone-800 dark:text-stone-100">{product.name}</b>
          {!product.isActive && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-800">Hidden in store — button won’t show</span>}
        </span>
        <a href={`#admin/products/${productId}/edit`} className="inline-flex items-center gap-1 font-semibold text-[#173f32] hover:underline dark:text-emerald-400">
          Photos &amp; description <ExternalLink size={11} />
        </a>
      </div>
      <VariantsEditor rows={current} onChange={setRows} />
      <div className="flex justify-end gap-2">
        {dirty && <button type="button" className={btn.ghost} disabled={saving} onClick={() => setRows(null)}>Discard</button>}
        <button type="button" className={btn.primary} disabled={!dirty || saving} onClick={() => void save()}>
          {saving ? <Spinner /> : <Save size={15} />} Save prices &amp; stock
        </button>
      </div>
    </div>
  )
}

function CreateGiftProduct({ collectionTitle, onCreated, onCancel }: { collectionTitle: string; onCreated: (productId: string) => Promise<void>; onCancel: () => void }) {
  const { data: categories = [] } = useGetAdminCategoriesQuery()
  const [createProduct, { isLoading }] = useCreateAdminProductMutation()
  const [name, setName] = useState(collectionTitle)
  const [categoryId, setCategoryId] = useState('')
  const [rows, setRows] = useState<VariantRow[]>([emptyVariant('1 hamper')])
  const giftCategory = categories.find((category) => /gift|hamper/i.test(category.slug)) ?? categories[0]

  const create = async () => {
    const problem = validateVariants(rows)
    if (problem) return void toast.error(problem)
    if (!name.trim()) return void toast.error('Enter the gift’s product name')
    try {
      const created = await createProduct({
        name: name.trim(),
        categoryId: categoryId || giftCategory?.id || '',
        variants: rows.map(toVariantInput),
      }).unwrap()
      await onCreated(created.id)
      toast.success(`“${name.trim()}” created and added`, { description: 'Add its photo under Products so it shows in the cart.' })
    } catch (err) {
      toast.error('Gift product not created', { description: errorMessage(err) })
    }
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-dashed border-stone-300 p-4 dark:border-stone-700">
      <p className="flex items-center gap-2 text-sm font-semibold text-stone-800 dark:text-stone-100"><PackagePlus size={16} /> Create the gift product</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className={labelClass}>Product name *</span>
          <input value={name} maxLength={160} onChange={(event) => setName(event.target.value)} className={input} />
        </label>
        <label>
          <span className={labelClass}>Category</span>
          <select value={categoryId || giftCategory?.id || ''} onChange={(event) => setCategoryId(event.target.value)} className={input}>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
      </div>
      <VariantsEditor rows={rows} onChange={setRows} />
      <div className="flex justify-end gap-2">
        <button type="button" className={btn.ghost} disabled={isLoading} onClick={onCancel}>Cancel</button>
        <button type="button" className={btn.primary} disabled={isLoading} onClick={() => void create()}>
          {isLoading ? <Spinner /> : <PackagePlus size={15} />} Create &amp; add to this collection
        </button>
      </div>
    </div>
  )
}
