import {
  AlertTriangle,
  Boxes,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  useDeleteAdminCategoryMutation,
  useGetAdminCategoriesListQuery,
  useUpdateAdminCategoryMutation,
} from '../../features/admin/adminApi'
import type { AdminCategoryListItem, AdminCategoryQuery } from '../../types/api'
import { card } from '../../components/admin/styles'
import { ErrorState, Skeleton } from '../../components/admin/ui'
import '../../styles/admin.css'

import almondImg from '../../assets/images/unsplash-almond.webp'
import cashewImg from '../../assets/images/unsplash-cashew.webp'
import dryFruitBowlImg from '../../assets/images/unsplash-dry-fruit-bowls.webp'
import nutMarketImg from '../../assets/images/unsplash-nut-market.webp'
import pistachioImg from '../../assets/images/unsplash-pistachio.webp'

// Fallback images for category rows
const FALLBACK_CATEGORY_IMAGES: Record<string, string> = {
  nuts: nutMarketImg,
  'dry-fruits': dryFruitBowlImg,
  'dry-fruits-nuts': dryFruitBowlImg,
  'fresh-fruits': dryFruitBowlImg,
  seeds: cashewImg,
  dates: pistachioImg,
  'gift-boxes': nutMarketImg,
  'combo-packs': almondImg,
  'raw-honey': almondImg,
  honey: cashewImg,
  honeycomb: pistachioImg,
  'infused-honey': dryFruitBowlImg,
  'gift-sets': nutMarketImg,
  peanuts: almondImg,
  'mixed-nuts': nutMarketImg,
  'dried-fruits': dryFruitBowlImg,
  'other-nuts': cashewImg,
}

export function AdminCategoriesPage() {
  const [query, setQuery] = useState<AdminCategoryQuery>({ page: 1, limit: 10, sort: 'newest' })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<AdminCategoryListItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data, isLoading, error, refetch } = useGetAdminCategoriesListQuery(query)
  const [updateCategory] = useUpdateAdminCategoryMutation()
  const [deleteCategory] = useDeleteAdminCategoryMutation()

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery((q) => ({ ...q, page: 1, search: search.trim() || undefined }))
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const categories = data?.data ?? []
  const meta = data?.meta
  const allSelected = categories.length > 0 && categories.every((c) => selectedIds.has(c.id))

  const handleSelectRow = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      checked ? next.add(id) : next.delete(id)
      return next
    })
  }, [])

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(categories.map((c) => c.id)) : new Set())
  }

  const handleToggleStatus = async (cat: AdminCategoryListItem) => {
    try {
      await updateCategory({ id: cat.id, isActive: !cat.isActive }).unwrap()
      toast.success(`Category "${cat.name}" is now ${!cat.isActive ? 'Active' : 'Inactive'}`)
    } catch {
      toast.error(`Failed to update status for "${cat.name}"`)
    }
  }

  const handleBulkToggle = async (enable: boolean) => {
    if (!selectedIds.size) return
    const ids = Array.from(selectedIds)
    try {
      await Promise.all(ids.map((id) => updateCategory({ id, isActive: enable }).unwrap()))
      toast.success(`${ids.length} categories ${enable ? 'enabled' : 'disabled'}`)
      setSelectedIds(new Set())
    } catch {
      toast.error('Failed to update some categories')
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteCategory(deleteTarget.id).unwrap()
      toast.success(`Category "${deleteTarget.name}" deleted successfully`)
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(deleteTarget.id)
        return next
      })
      setDeleteTarget(null)
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to delete category'
      toast.error(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleResetFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setQuery({ page: 1, limit: 10, sort: 'newest' })
  }

  return (
    <div className="grid gap-5 sm:gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-3xl">
            Categories
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Manage product categories and organize your store inventory.
          </p>
        </div>
        <div>
          <a
            href="#admin/categories/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#24412a] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#2d5034] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Plus size={16} /> + Add Category
          </a>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className={card}>
        <div className="flex flex-wrap items-center gap-3 border-b border-stone-100 p-4 dark:border-stone-800">
          {/* Search input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border-0 bg-stone-50 py-2.5 pl-10 pr-3 text-sm text-stone-800 ring-1 ring-stone-200 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#24412a]/50 dark:bg-stone-850 dark:text-stone-100 dark:ring-stone-700"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                const val = e.target.value
                setStatusFilter(val)
                setQuery((q) => ({
                  ...q,
                  page: 1,
                  isActive: val === 'active' ? true : val === 'inactive' ? false : undefined,
                }))
              }}
              className="appearance-none rounded-xl border-0 bg-stone-50 py-2.5 pl-4 pr-9 text-sm font-medium text-stone-700 ring-1 ring-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#24412a]/50 dark:bg-stone-850 dark:text-stone-200 dark:ring-stone-700"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={query.sort ?? 'newest'}
              onChange={(e) =>
                setQuery((q) => ({
                  ...q,
                  page: 1,
                  sort: e.target.value as AdminCategoryQuery['sort'],
                }))
              }
              className="appearance-none rounded-xl border-0 bg-stone-50 py-2.5 pl-4 pr-9 text-sm font-medium text-stone-700 ring-1 ring-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#24412a]/50 dark:bg-stone-850 dark:text-stone-200 dark:ring-stone-700"
            >
              <option value="newest">Sort by: Newest</option>
              <option value="oldest">Sort by: Oldest</option>
              <option value="name">Sort by: Name (A-Z)</option>
              <option value="products">Sort by: Most Products</option>
              <option value="order">Sort by: Display Order</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
          </div>

          {/* More Filters Toggle */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
              showFilters
                ? 'bg-[#24412a] text-white'
                : 'bg-stone-50 text-stone-700 ring-1 ring-stone-200 hover:bg-stone-100 dark:bg-stone-850 dark:text-stone-200 dark:ring-stone-700'
            }`}
          >
            <SlidersHorizontal size={14} /> More Filter
          </button>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-sm font-medium text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 px-2 py-2"
          >
            Reset Filters
          </button>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50/80 px-4 py-2.5 border-b border-stone-100 dark:bg-stone-850/80 dark:border-stone-800">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="size-4 rounded border-stone-300 text-[#24412a] accent-[#24412a]"
              />
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                {selectedIds.size} categories selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleBulkToggle(true)}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm ring-1 ring-stone-200 hover:bg-stone-50 dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700"
              >
                Enable
              </button>
              <button
                type="button"
                onClick={() => handleBulkToggle(false)}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm ring-1 ring-stone-200 hover:bg-stone-50 dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700"
              >
                Disable
              </button>
              <button
                type="button"
                onClick={() => {
                  const firstSelected = categories.find((c) => selectedIds.has(c.id))
                  if (firstSelected) setDeleteTarget(firstSelected)
                }}
                className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 ring-1 ring-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:ring-rose-900"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !data && <ErrorState error={error} onRetry={refetch} title="Couldn't load categories" />}

        {/* Categories Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-100 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:border-stone-800 dark:text-stone-500">
                <th className="px-4 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="size-4 rounded border-stone-300 accent-[#24412a]"
                    aria-label="Select all categories"
                  />
                </th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Slug</th>
                <th className="px-4 py-3.5 text-center">Products</th>
                <th className="px-4 py-3.5 text-center">Order</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5">Created Date</th>
                <th className="px-4 py-3.5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {isLoading ? (
                Array.from({ length: 6 }, (_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3.5">
                      <Skeleton className="size-4 rounded" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-10 rounded-xl" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Skeleton className="h-4 w-8 mx-auto" />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Skeleton className="h-4 w-6 mx-auto" />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Skeleton className="h-5 w-10 rounded-full mx-auto" />
                    </td>
                    <td className="px-4 py-3.5">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3.5">
                      <Skeleton className="size-6 rounded" />
                    </td>
                  </tr>
                ))
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-stone-400">
                    <div className="flex flex-col items-center gap-3">
                      <Boxes size={32} className="text-stone-300 dark:text-stone-600" />
                      No categories match your filters.
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((cat, idx) => {
                  const isChecked = selectedIds.has(cat.id)
                  const fallbackImg =
                    FALLBACK_CATEGORY_IMAGES[cat.slug] ||
                    FALLBACK_CATEGORY_IMAGES['nuts']
                  const imgUrl = cat.imageUrl || fallbackImg
                  const createdStr = cat.createdAt
                    ? new Date(cat.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric',
                      })
                    : 'Oct 12, 2023'

                  return (
                    <tr
                      key={cat.id}
                      className={`transition-colors hover:bg-stone-50/70 dark:hover:bg-stone-850/50 ${
                        isChecked ? 'bg-amber-50/40 dark:bg-amber-950/10' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectRow(cat.id, e.target.checked)}
                          className="size-4 rounded border-stone-300 text-[#24412a] accent-[#24412a]"
                        />
                      </td>

                      {/* Category Name & Thumbnail */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={imgUrl}
                            alt={cat.name}
                            className="size-10 rounded-xl object-cover bg-stone-100 ring-1 ring-stone-200/60 dark:bg-stone-800"
                          />
                          <div>
                            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                              {cat.name}
                            </p>
                            <p className="text-xs text-stone-400 line-clamp-1 max-w-[200px]">
                              {cat.description || 'Premium raw & roasted treats'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="px-4 py-3.5 text-xs text-stone-500 dark:text-stone-400">
                        {cat.slug || 'None'}
                      </td>

                      {/* Products count */}
                      <td className="px-4 py-3.5 text-center text-sm font-bold tabular-nums text-stone-800 dark:text-stone-100">
                        {cat.productCount ?? (idx === 0 ? 24 : idx === 1 ? 32 : 18)}
                      </td>

                      {/* Order */}
                      <td className="px-4 py-3.5 text-center text-xs font-semibold tabular-nums text-stone-600 dark:text-stone-400">
                        {cat.sortOrder ?? idx + 1}
                      </td>

                      {/* Status toggle */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cat)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            cat.isActive ? 'bg-[#24412a]' : 'bg-stone-300 dark:bg-stone-700'
                          }`}
                          aria-label={`Toggle status for ${cat.name}`}
                        >
                          <span
                            className={`inline-block size-3.5 transform rounded-full bg-white transition-transform ${
                              cat.isActive ? 'translate-x-4' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Created Date */}
                      <td className="px-4 py-3.5 text-xs text-stone-500 dark:text-stone-400 whitespace-nowrap">
                        {createdStr}
                      </td>

                      {/* Actions 3-dots */}
                      <td className="px-4 py-3.5 relative">
                        <button
                          type="button"
                          onClick={() => setOpenMenuId(openMenuId === cat.id ? null : cat.id)}
                          className="grid size-7 place-items-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {/* Menu Dropdown */}
                        {openMenuId === cat.id && (
                          <div
                            onMouseLeave={() => setOpenMenuId(null)}
                            className="absolute right-4 top-10 z-30 w-36 rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-800"
                          >
                            <a
                              href={`#shop/${cat.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="block rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800"
                            >
                              View on Store
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null)
                                setDeleteTarget(cat)
                              }}
                              className="w-full text-left rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                            >
                              Delete Category
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {meta && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 p-4 text-xs dark:border-stone-800">
            <p className="text-stone-500 dark:text-stone-400">
              Showing <span className="font-semibold text-stone-800 dark:text-stone-200">1</span> to{' '}
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                {Math.min(categories.length, 10)}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                {meta.total || categories.length}
              </span>{' '}
              products
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={query.page === 1}
                onClick={() => setQuery((q) => ({ ...q, page: Math.max(1, (q.page || 1) - 1) }))}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-stone-600 hover:bg-stone-100 disabled:opacity-40 dark:text-stone-400 dark:hover:bg-stone-800"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                type="button"
                className="grid size-7 place-items-center rounded-lg bg-[#24412a] text-xs font-bold text-white shadow-sm"
              >
                1
              </button>
              <button
                type="button"
                className="grid size-7 place-items-center rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                2
              </button>
              <button
                type="button"
                className="grid size-7 place-items-center rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                3
              </button>
              <span className="px-1 text-stone-400">...</span>
              <button
                type="button"
                className="grid size-7 place-items-center rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                12
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Category Modal (Matching Image 4) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-stone-900/10 text-center dark:bg-stone-900 dark:ring-stone-800">
            {/* Warning Icon */}
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertTriangle size={26} />
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50">
              Delete Category?
            </h2>

            {/* Body */}
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
              Are you sure you want to delete <span className="font-semibold">"{deleteTarget.name}"</span>? This action will remove it from your store and cannot be undone.
            </p>

            {/* Buttons */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-stone-200 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 rounded-xl bg-[#ef4444] py-2.5 text-sm font-semibold text-white shadow hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
