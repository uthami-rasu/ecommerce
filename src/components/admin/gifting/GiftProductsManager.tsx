import { Check, ChevronLeft, ChevronRight, ExternalLink, Package, Plus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  useGetAdminGiftOccasionsQuery,
  useGetAdminGiftProductsQuery,
  useSetGiftProductOccasionsMutation,
} from '../../../features/gifting/giftingApi'
import { errorMessage } from '../../../lib/http/apiClient'
import type { AdminGiftOccasion, AdminGiftProduct } from '../../../types/api'
import { formatMoney } from '../../../utils/format'
import { btn, input } from '../styles'
import { Card, CardHeader, EmptyState, ErrorState, Skeleton, Switch } from '../ui'

const PAGE_SIZE = 15

export function GiftProductsManager() {
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [onlyGifts, setOnlyGifts] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const occasions = useGetAdminGiftOccasionsQuery()
  const products = useGetAdminGiftProductsQuery({ search: debounced || undefined, onlyGifts: onlyGifts || undefined, page, limit: PAGE_SIZE })
  const meta = products.data?.meta

  return (
    <Card>
      <CardHeader
        icon={Package}
        title="Gift products"
        description="Tick the occasions a product is a gift for. Prices, photos and stock are edited under Products."
        action={<a href="#admin/products/new" className={btn.small}><Plus size={13} /> New product</a>}
      />
      <div className="flex flex-wrap items-center gap-4 border-b border-stone-100 px-5 py-4 dark:border-stone-800">
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden />
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search all products…" aria-label="Search products" className={`${input} pl-10`} />
        </div>
        <div className="w-64">
          <Switch checked={onlyGifts} onChange={(value) => { setOnlyGifts(value); setPage(1) }} label="Only products on the gift page" />
        </div>
      </div>

      {products.isLoading || occasions.isLoading ? (
        <div className="grid gap-3 p-5">{[0, 1, 2, 3].map((key) => <Skeleton key={key} className="h-16" />)}</div>
      ) : products.error || !products.data ? (
        <ErrorState error={products.error} onRetry={products.refetch} />
      ) : products.data.data.length === 0 ? (
        <EmptyState icon={Package} title={onlyGifts && !debounced ? 'No gift products yet' : 'No products found'}>
          {onlyGifts ? 'Switch off “Only products on the gift page” to pick from your whole catalogue.' : 'Try a different search.'}
        </EmptyState>
      ) : (
        <ul className="divide-y divide-stone-100 dark:divide-stone-800">
          {products.data.data.map((product) => <ProductRow key={product.id} product={product} occasions={occasions.data ?? []} />)}
        </ul>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-stone-100 px-5 py-3 text-xs text-stone-500 dark:border-stone-800">
          <span>Page {meta.page} of {meta.totalPages} · {meta.total} products</span>
          <div className="flex gap-1">
            <button type="button" className={btn.small} disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={13} /> Previous</button>
            <button type="button" className={btn.small} disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}>Next <ChevronRight size={13} /></button>
          </div>
        </div>
      )}
    </Card>
  )
}

function ProductRow({ product, occasions }: { product: AdminGiftProduct; occasions: AdminGiftOccasion[] }) {
  const [save, { isLoading }] = useSetGiftProductOccasionsMutation()
  const selected = new Set(product.occasionIds)

  const toggle = async (occasion: AdminGiftOccasion) => {
    const next = selected.has(occasion.id) ? product.occasionIds.filter((id) => id !== occasion.id) : [...product.occasionIds, occasion.id]
    try {
      await save({ productId: product.id, occasionIds: next }).unwrap()
      toast.success(next.length ? `${product.name}: ${next.length} ${next.length === 1 ? 'occasion' : 'occasions'}` : `${product.name} removed from the gift page`)
    } catch (err) {
      toast.error('Not saved', { description: errorMessage(err) })
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-4 px-5 py-4" aria-busy={isLoading}>
      <span className="size-12 shrink-0 overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800">
        {product.thumbUrl && <img src={product.thumbUrl} alt="" className="size-full object-cover" />}
      </span>
      <div className="min-w-[180px] flex-1">
        <p className="font-semibold text-stone-900 dark:text-stone-50">
          {product.name}
          {!product.isActive && <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase text-stone-500 dark:bg-stone-800">Hidden in store</span>}
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {product.category} · from {formatMoney(product.price)} ·{' '}
          <a href={`#admin/products/${product.id}/edit`} className="inline-flex items-center gap-0.5 font-semibold text-[#173f32] hover:underline dark:text-emerald-400">Edit product <ExternalLink size={10} /></a>
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Occasions for ${product.name}`}>
        {occasions.map((occasion) => {
          const on = selected.has(occasion.id)
          return (
            <button
              key={occasion.id}
              type="button"
              aria-pressed={on}
              disabled={isLoading}
              onClick={() => void toggle(occasion)}
              title={occasion.isActive ? undefined : 'This occasion is hidden on the page'}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                on
                  ? 'bg-[#173f32] text-white dark:bg-emerald-600'
                  : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:ring-stone-400 dark:bg-stone-900 dark:text-stone-300 dark:ring-stone-700'
              } ${occasion.isActive ? '' : 'line-through decoration-stone-400'}`}
            >
              {on && <Check size={12} aria-hidden />} {occasion.name}
            </button>
          )
        })}
      </div>
    </li>
  )
}
