import { ExternalLink, PackagePlus, Save } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAppDispatch } from '../../../app/hooks'
import { adminApi, useCreateAdminProductMutation, useGetAdminCategoriesQuery, useGetAdminProductQuery } from '../../../features/admin/adminApi'
import { errorMessage } from '../../../lib/http/apiClient'
import { adminRepository } from '../../../repositories/adminRepository'
import { btn, input, label as labelClass } from '../styles'
import { Spinner } from '../ui'
import { VariantsEditor } from '../VariantsEditor'
import { emptyVariant, syncVariants, toVariantInput, toVariantRow, validateVariants, type VariantRow } from '../variants'

/**
 * Price, MRP and stock of the gift a collection sells — edited right on the gift page settings.
 * With no product linked yet, creates one (the gift becomes a normal product, so cart,
 * checkout and Razorpay work unchanged).
 */
export function GiftProductPanel({ productId, collectionTitle, onCreated }: {
  productId: string | null
  collectionTitle: string
  onCreated: (productId: string) => Promise<void>
}) {
  return productId ? (
    <LinkedProduct key={productId} productId={productId} />
  ) : (
    <CreateGiftProduct collectionTitle={collectionTitle} onCreated={onCreated} />
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

function CreateGiftProduct({ collectionTitle, onCreated }: { collectionTitle: string; onCreated: (productId: string) => Promise<void> }) {
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
      toast.success(`“${name.trim()}” created and linked`, { description: 'Add its photo under Products so it shows in the cart.' })
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
      <div className="flex justify-end">
        <button type="button" className={btn.primary} disabled={isLoading} onClick={() => void create()}>
          {isLoading ? <Spinner /> : <PackagePlus size={15} />} Create &amp; link to this collection
        </button>
      </div>
    </div>
  )
}
