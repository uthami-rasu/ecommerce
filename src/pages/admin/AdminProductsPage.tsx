import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Package,
  PackageX,
  Search,
  SlidersHorizontal,
  Trash2,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useDeleteAdminProductMutation, useGetAdminCategoriesQuery, useGetAdminProductsQuery } from '../../features/admin/adminApi'
import type { AdminProductListItem, AdminProductQuery } from '../../types/api'
import { formatMoney } from '../../utils/format'
import { card } from '../../components/admin/styles'
import { ErrorState, Skeleton, Spinner } from '../../components/admin/ui'
import '../../styles/admin.css'

// ── Stat tile ─────────────────────────────────────────────────────────────────

function StatBadge({
  label, value, icon: Icon, color,
}: {
  label: string; value: number | string; icon: React.ElementType; color: 'blue' | 'green' | 'amber' | 'red'
}) {
  const colors = {
    blue:  'bg-blue-50   text-blue-600   ring-blue-200   dark:bg-blue-950/30  dark:text-blue-400  dark:ring-blue-900/60',
    green: 'bg-green-50  text-green-600  ring-green-200  dark:bg-green-950/30 dark:text-green-400 dark:ring-green-900/60',
    amber: 'bg-amber-50  text-amber-600  ring-amber-200  dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-900/60',
    red:   'bg-rose-50   text-rose-600   ring-rose-200   dark:bg-rose-950/30  dark:text-rose-400  dark:ring-rose-900/60',
  }
  const iconColors = {
    blue:  'bg-blue-100  text-blue-600  dark:bg-blue-900/60  dark:text-blue-300',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/60 dark:text-green-300',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/60 dark:text-amber-300',
    red:   'bg-rose-100  text-rose-600  dark:bg-rose-900/60  dark:text-rose-300',
  }
  return (
    <div className={`flex items-center gap-3 rounded-2xl p-4 ring-1 ${colors[color]}`}>
      <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${iconColors[color]}`}>
        <Icon size={18} aria-hidden />
      </span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
        <p className="text-2xl font-bold tabular-nums leading-tight">{value}</p>
      </div>
    </div>
  )
}

// ── Stock badge ───────────────────────────────────────────────────────────────

function StockBadge({ status, stock }: { status: AdminProductListItem['stockStatus']; stock: number }) {
  if (status === 'out_of_stock') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600 ring-1 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900">
        <XCircle size={11} aria-hidden /> Out of Stock
      </span>
    )
  }
  if (status === 'low_stock') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900">
        <AlertTriangle size={11} aria-hidden /> Low Stock ({stock})
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900">
      <CheckCircle2 size={11} aria-hidden /> In Stock ({stock})
    </span>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────

function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
      ACTIVE
    </span>
  ) : (
    <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-bold text-stone-500 dark:bg-stone-800 dark:text-stone-400">
      INACTIVE
    </span>
  )
}

// ── Product row ───────────────────────────────────────────────────────────────

function ProductRow({
  product,
  selected,
  onSelect,
  onDelete,
  deleting,
}: {
  product: AdminProductListItem
  selected: boolean
  onSelect: (id: string, checked: boolean) => void
  onDelete: (id: string, name: string) => void
  deleting: boolean
}) {
  return (
    <tr className={`border-b border-stone-100 transition-colors last:border-0 hover:bg-[#faf8f4] dark:border-stone-800 dark:hover:bg-stone-800/40 ${selected ? 'bg-amber-50/50 dark:bg-amber-950/10' : ''}`}>
      {/* Checkbox */}
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={e => onSelect(product.id, e.target.checked)}
          className="size-4 rounded border-stone-300 text-[#173f32] accent-[#173f32] focus:ring-amber-400"
          aria-label={`Select ${product.name}`}
        />
      </td>

      {/* Product name + image */}
      <td className="min-w-[180px] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800">
            {product.thumbUrl ? (
              <img src={product.thumbUrl} alt={product.name} className="size-full object-cover" />
            ) : (
              <Package size={18} className="text-stone-400" aria-hidden />
            )}
          </div>
          <a
            href={`#product/${product.slug}`}
            target="_blank"
            rel="noreferrer"
            className="line-clamp-2 text-sm font-semibold text-stone-800 hover:text-[#173f32] hover:underline dark:text-stone-100 dark:hover:text-emerald-300"
          >
            {product.name}
          </a>
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-3">
        <span className="text-xs font-semibold text-[#173f32] dark:text-emerald-400">
          {product.category.name}
        </span>
      </td>

      {/* Variants */}
      <td className="px-4 py-3 text-center text-sm tabular-nums text-stone-600 dark:text-stone-400">
        {product.variantCount}
      </td>

      {/* Price */}
      <td className="px-4 py-3 text-sm font-semibold tabular-nums text-stone-800 dark:text-stone-100">
        {formatMoney(product.price)}
      </td>

      {/* Stock */}
      <td className="px-4 py-3">
        <StockBadge status={product.stockStatus} stock={product.totalStock} />
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <ActiveBadge active={product.isActive} />
      </td>

      {/* Updated */}
      <td className="hidden px-4 py-3 text-xs text-stone-400 dark:text-stone-500 lg:table-cell">
        {new Date(product.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <a
            href={`#admin/products/${product.id}/edit`}
            title="Edit product"
            className="grid size-7 place-items-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-700 dark:hover:text-stone-200"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
          </a>
          <a
            href={`#product/${product.slug}`}
            target="_blank"
            rel="noreferrer"
            title="View on storefront"
            className="grid size-7 place-items-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-700 dark:hover:text-stone-200"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </a>
          <button
            type="button"
            title="Delete product"
            disabled={deleting}
            onClick={() => onDelete(product.id, product.name)}
            className="grid size-7 place-items-center rounded-lg text-stone-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
          >
            {deleting ? <Spinner className="size-3.5" /> : <Trash2 size={13} aria-hidden />}
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, total, limit, onChange }: {
  page: number; totalPages: number; total: number; limit: number; onChange: (p: number) => void
}) {
  const from = Math.min((page - 1) * limit + 1, total)
  const to = Math.min(page * limit, total)

  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 px-4 py-3 text-sm dark:border-stone-800">
      <p className="text-stone-500 dark:text-stone-400">
        Showing <span className="font-semibold text-stone-800 dark:text-stone-200">{from}</span> to{' '}
        <span className="font-semibold text-stone-800 dark:text-stone-200">{to}</span> of{' '}
        <span className="font-semibold text-stone-800 dark:text-stone-200">{total}</span> products
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="grid size-8 place-items-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 disabled:opacity-40 dark:hover:bg-stone-800"
        >
          <ChevronLeft size={16} aria-hidden />
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-stone-400">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p as number)}
              className={`grid size-8 place-items-center rounded-lg text-sm font-semibold transition-colors ${
                p === page
                  ? 'bg-[#173f32] text-white dark:bg-emerald-600'
                  : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="grid size-8 place-items-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 disabled:opacity-40 dark:hover:bg-stone-800"
        >
          <ChevronRight size={16} aria-hidden />
        </button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const LIMIT = 10

export function AdminProductsPage() {
  const [query, setQuery] = useState<AdminProductQuery>({ page: 1, limit: LIMIT })
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading, error, refetch } = useGetAdminProductsQuery(query)
  const { data: categories } = useGetAdminCategoriesQuery()
  const [deleteProduct] = useDeleteAdminProductMutation()

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(q => ({ ...q, page: 1, search: search.trim() || undefined }))
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  const handleSelect = useCallback((id: string, checked: boolean) => {
    setSelected(prev => {
      const next = new Set(prev)
      checked ? next.add(id) : next.delete(id)
      return next
    })
  }, [])

  const handleSelectAll = (checked: boolean) => {
    setSelected(checked ? new Set(data?.data.map(p => p.id) ?? []) : new Set())
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeletingIds(prev => new Set([...prev, id]))
    try {
      await deleteProduct(id).unwrap()
      toast.success(`"${name}" deleted`)
      setSelected(prev => { const next = new Set(prev); next.delete(id); return next })
    } catch {
      toast.error(`Failed to delete "${name}"`)
    } finally {
      setDeletingIds(prev => { const next = new Set(prev); next.delete(id); return next })
    }
  }

  const handleBulkDelete = async () => {
    if (!selected.size) return
    if (!window.confirm(`Delete ${selected.size} product${selected.size > 1 ? 's' : ''}? This cannot be undone.`)) return
    const ids = [...selected]
    for (const id of ids) {
      const product = data?.data.find(p => p.id === id)
      await handleDelete(id, product?.name ?? id)
    }
  }

  const products = data?.data ?? []
  const meta = data?.meta
  const allSelected = products.length > 0 && products.every(p => selected.has(p.id))

  // Stats derived from dashboard data (using product counts from data meta)
  const totalItems = meta?.total ?? 0
  const activeItems = products.filter(p => p.isActive).length
  const lowStock = products.filter(p => p.stockStatus === 'low_stock').length
  const outOfStock = products.filter(p => p.stockStatus === 'out_of_stock').length

  return (
    <div className="grid gap-5 sm:gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#173f32] dark:text-stone-50 sm:text-4xl">Products</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Manage your product catalog, variants, and stock levels.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selected.size > 0 && (
            <button
              type="button"
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700"
            >
              <Trash2 size={15} aria-hidden /> Delete {selected.size} selected
            </button>
          )}
          <a
            href="#admin/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#24412a] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#2d5034] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Package size={15} aria-hidden /> + Add Product
          </a>
        </div>
      </div>

      {/* Stat tiles */}
      <section aria-label="Product stats" className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <StatBadge label="Total Items" value={isLoading ? '—' : totalItems} icon={Package} color="blue" />
        <StatBadge label="Active Items" value={isLoading ? '—' : activeItems} icon={CheckCircle2} color="green" />
        <StatBadge label="Low Stock" value={isLoading ? '—' : lowStock} icon={AlertTriangle} color="amber" />
        <StatBadge label="Out of Stock" value={isLoading ? '—' : outOfStock} icon={PackageX} color="red" />
      </section>

      {/* Filters + table */}
      <div className={card}>
        {/* Search & filter bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-stone-100 px-4 py-3 dark:border-stone-800">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden />
            <input
              type="search"
              placeholder="Search product name, SKU…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border-0 bg-stone-50 py-2 pl-8 pr-3 text-sm text-stone-800 ring-1 ring-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#173f32]/50 dark:bg-stone-800 dark:text-stone-100 dark:ring-stone-700"
            />
          </div>

          {/* Category filter */}
          <select
            value={query.categoryId ?? ''}
            onChange={e => setQuery(q => ({ ...q, page: 1, categoryId: e.target.value || undefined }))}
            className="rounded-xl border-0 bg-stone-50 px-3 py-2 text-sm text-stone-700 ring-1 ring-stone-200 focus:outline-none focus:ring-2 focus:ring-[#173f32]/50 dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700"
          >
            <option value="">Category: All</option>
            {(categories ?? []).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={query.isActive === undefined ? '' : query.isActive ? 'active' : 'inactive'}
            onChange={e => setQuery(q => ({ ...q, page: 1, isActive: e.target.value === '' ? undefined : e.target.value === 'active' }))}
            className="rounded-xl border-0 bg-stone-50 px-3 py-2 text-sm text-stone-700 ring-1 ring-stone-200 focus:outline-none focus:ring-2 focus:ring-[#173f32]/50 dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700"
          >
            <option value="">Status: All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Stock filter */}
          <select
            value={query.stockStatus ?? ''}
            onChange={e => setQuery(q => ({ ...q, page: 1, stockStatus: (e.target.value as any) || undefined }))}
            className="rounded-xl border-0 bg-stone-50 px-3 py-2 text-sm text-stone-700 ring-1 ring-stone-200 focus:outline-none focus:ring-2 focus:ring-[#173f32]/50 dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700"
          >
            <option value="">Stock: All</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          <button
            type="button"
            onClick={() => setShowFilters(f => !f)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${showFilters ? 'bg-[#173f32] text-white' : 'bg-stone-50 text-stone-600 ring-1 ring-stone-200 hover:bg-stone-100 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-700'}`}
          >
            <SlidersHorizontal size={14} aria-hidden /> More Filters
          </button>
        </div>

        {/* Error */}
        {error && !data && (
          <ErrorState error={error} onRetry={refetch} title="Couldn't load products" />
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-100 dark:border-stone-800">
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={e => handleSelectAll(e.target.checked)}
                    className="size-4 rounded border-stone-300 accent-[#173f32]"
                    aria-label="Select all"
                  />
                </th>
                {['Product', 'Category', 'Variants', 'Price', 'Stock', 'Status', 'Updated', 'Actions'].map(col => (
                  <th key={col} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: LIMIT }, (_, i) => (
                  <tr key={i} className="border-b border-stone-100 dark:border-stone-800">
                    <td className="px-4 py-3"><Skeleton className="size-4 rounded" /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-10 rounded-xl" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-8" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-24 rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="hidden px-4 py-3 lg:table-cell"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-6 w-12 rounded-lg" /></td>
                  </tr>
                ))
                : products.map(product => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    selected={selected.has(product.id)}
                    onSelect={handleSelect}
                    onDelete={handleDelete}
                    deleting={deletingIds.has(product.id)}
                  />
                ))
              }
              {!isLoading && !error && products.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-sm text-stone-400 dark:text-stone-500">
                    <div className="flex flex-col items-center gap-3">
                      <Boxes size={32} className="text-stone-300 dark:text-stone-600" />
                      No products match your filters.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 0 && (
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            limit={meta.limit}
            onChange={p => setQuery(q => ({ ...q, page: p }))}
          />
        )}
      </div>
    </div>
  )
}
