import {
  ArrowRight,
  CheckCircle2,
  Eye,
  Image as ImageIcon,
  Info,
  Sliders,
  UploadCloud,
  X,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import {
  useCreateAdminCategoryMutation,
  useUploadCategoryImageMutation,
} from '../../features/admin/adminApi'
import { card } from '../../components/admin/styles'
import { navigate } from '../../utils/router'
import '../../styles/admin.css'

import dryFruitBowlImg from '../../assets/images/unsplash-dry-fruit-bowls.webp'

export function AdminAddCategoryPage() {
  const [createCategory, { isLoading }] = useCreateAdminCategoryMutation()
  const [uploadImage] = useUploadCategoryImageMutation()

  // Form states
  const [name, setName] = useState('Premium Dry Fruits')
  const [slug, setSlug] = useState('Premium Dry Fruits')
  const [description, setDescription] = useState(
    'Elevate your snacking experience with our premium selection of carefully sourced dry fruits. From sun-dried apricots to buttery cashews, every bite is a nutritious treat.'
  )
  const [displayOrder, setDisplayOrder] = useState('1')
  const [isActive, setIsActive] = useState(true)

  // Image states
  const [imagePreview, setImagePreview] = useState<string>(dryFruitBowlImg)
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Validation
  const [nameError, setNameError] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const handleNameChange = (val: string) => {
    setName(val)
    if (val.trim()) setNameError(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault()

    if (!name.trim()) {
      setNameError(true)
      toast.error('Category name is required')
      return
    }

    try {
      const derivedSlug = (slug.trim() || name.trim())
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const payload = {
        name: name.trim(),
        slug: derivedSlug,
        description: description.trim() || undefined,
        sortOrder: parseInt(displayOrder, 10) || 0,
        isActive,
      }

      const res = await createCategory(payload).unwrap()
      const createdId = res?.id

      if (createdId && imageFile) {
        const formData = new FormData()
        formData.append('image', imageFile)
        await uploadImage({ id: createdId, formData }).unwrap().catch(() => null)
      }

      setShowToast(true)
      toast.success(`Category "${name}" created successfully!`)

      setTimeout(() => {
        navigate('admin/categories')
      }, 1500)
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to create category'
      toast.error(msg)
    }
  }

  return (
    <div className="grid gap-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-stone-400">
        <a href="#admin" className="hover:text-stone-700 transition-colors">
          Admin
        </a>
        <span>&gt;</span>
        <a href="#admin/categories" className="hover:text-stone-700 transition-colors">
          Categories
        </a>
        <span>&gt;</span>
        <span className="text-stone-700 font-semibold dark:text-stone-200">Add Category</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-3xl">
            Add Category
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Create a new category to organize your products efficiently.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('admin/categories')}
            className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm hover:bg-stone-50 transition-colors dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            Discard
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSubmit()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#24412a] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#2d5034] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-50"
          >
            + Create Category
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column (8 cols): Category Info & Category Image */}
          <div className="lg:col-span-8 space-y-6">
            {/* Category Information Card */}
            <div className={`${card} p-5 sm:p-6 space-y-5`}>
              <div className="flex items-center gap-2.5 border-b border-stone-100 pb-4 dark:border-stone-800">
                <span className="grid size-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Info size={16} />
                </span>
                <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100">
                  Category Information
                </h2>
              </div>

              {/* Category Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Premium Dry Fruits"
                  className={`w-full rounded-xl border-0 py-2.5 px-3.5 text-sm text-stone-800 ring-1 focus:bg-white focus:outline-none focus:ring-2 dark:bg-stone-850 dark:text-stone-100 ${
                    nameError
                      ? 'bg-rose-50/50 ring-rose-400 focus:ring-rose-500'
                      : 'bg-stone-50/70 ring-stone-200 focus:ring-[#24412a]/50 dark:ring-stone-700'
                  }`}
                />
                {nameError && (
                  <p className="mt-1 text-xs text-rose-500">Category name is required</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="premium-dry-fruits"
                  className="w-full rounded-xl border-0 bg-stone-50/70 py-2.5 px-3.5 text-sm text-stone-800 ring-1 ring-stone-200 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#24412a]/50 dark:bg-stone-850 dark:text-stone-100 dark:ring-stone-700"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter category description for SEO and customers..."
                  className="w-full rounded-xl border-0 bg-stone-50/70 py-2.5 px-3.5 text-sm text-stone-800 ring-1 ring-stone-200 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#24412a]/50 dark:bg-stone-850 dark:text-stone-100 dark:ring-stone-700"
                />
              </div>
            </div>

            {/* Category Image Card */}
            <div className={`${card} p-5 sm:p-6 space-y-4`}>
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <ImageIcon size={16} />
                  </span>
                  <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                    Category Image
                  </h2>
                </div>
                <span className="text-[11px] text-stone-400">Recommended: 800 × 800px</span>
              </div>

              {/* Split container: Left Preview + Right Upload Area */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* Left Preview */}
                <div className="sm:col-span-4 flex justify-center">
                  <div className="relative size-36 overflow-hidden rounded-2xl bg-stone-100 shadow-sm ring-1 ring-stone-200/80 dark:bg-stone-800">
                    <img
                      src={imagePreview}
                      alt="Category preview"
                      className="size-full object-cover"
                    />
                  </div>
                </div>

                {/* Right Upload Area */}
                <div className="sm:col-span-8">
                  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50 p-6 text-center dark:border-stone-700 dark:bg-stone-850/50">
                    <span className="grid size-10 place-items-center rounded-full bg-emerald-50 text-emerald-600 mb-2 dark:bg-emerald-950/60 dark:text-emerald-400">
                      <UploadCloud size={20} />
                    </span>
                    <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">JPG, PNG or WebP (max. 2MB)</p>
                    <label className="mt-3 cursor-pointer rounded-xl bg-white px-4 py-1.5 text-xs font-semibold text-stone-700 shadow-sm ring-1 ring-stone-200 hover:bg-stone-50 transition-colors dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700">
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Storefront Preview & Display Settings */}
          <div className="lg:col-span-4 space-y-6">
            {/* Storefront Preview Card */}
            <div className={`${card} p-5 space-y-4`}>
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3 dark:border-stone-800">
                <span className="grid size-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Eye size={16} />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                    Storefront Preview
                  </h2>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
                    HOW CUSTOMERS WILL SEE IT
                  </p>
                </div>
              </div>

              {/* Reactive Card matching Image 5 */}
              <div className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-stone-200/80 dark:bg-stone-850 dark:ring-stone-700">
                {/* Image & Dark Gradient Overlay */}
                <div className="relative h-44 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <img
                    src={imagePreview}
                    alt={name}
                    className="size-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  {/* Status Badge */}
                  <div className="absolute left-3 top-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase backdrop-blur-md ${
                        isActive
                          ? 'bg-emerald-900/80 text-emerald-200'
                          : 'bg-stone-900/80 text-stone-300'
                      }`}
                    >
                      <span className={`size-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-stone-400'}`} />
                      {isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  {/* Gradient bottom overlay with Title */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3.5 pt-8 text-white">
                    <p className="font-display text-base font-bold leading-tight">
                      {name || 'Category Name'}
                    </p>
                    <p className="text-[11px] text-stone-200/80 font-medium">
                      24 Products Available
                    </p>
                  </div>
                </div>

                {/* Description snippet */}
                <div className="p-4 space-y-3">
                  <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-3 leading-relaxed">
                    {description || 'Elevate your snacking experience with our premium selection of carefully sourced organic treats.'}
                  </p>
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer tracking-wide uppercase">
                      EXPLORE COLLECTION <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Display Settings Card */}
            <div className={`${card} p-5 space-y-4`}>
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3 dark:border-stone-800">
                <span className="grid size-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Sliders size={16} />
                </span>
                <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                  Display Settings
                </h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="w-full rounded-xl border-0 bg-stone-50 py-2 px-3 text-sm font-medium text-stone-800 ring-1 ring-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#24412a]/50 dark:bg-stone-800 dark:text-stone-100 dark:ring-stone-700"
                />
                <p className="mt-1 text-[11px] text-stone-400">Position in list</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Visibility Status
                  </p>
                  <p className="text-[11px] text-stone-400">Show/Hide in store</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                      isActive ? 'bg-[#24412a]' : 'bg-stone-300 dark:bg-stone-700'
                    }`}
                  >
                    <span
                      className={`inline-block size-3.5 transform rounded-full bg-white transition-transform ${
                        isActive ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                    {isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80 dark:bg-stone-900 dark:ring-stone-800">
          <button
            type="button"
            onClick={() => navigate('admin/categories')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
          >
            <X size={15} /> Cancel & Discard
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toast.success('Category draft saved')}
              className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors dark:border-stone-700 dark:bg-stone-850 dark:text-stone-200"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-[#24412a] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#2d5034] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </div>
      </form>

      {/* Floating Success Toast (Matching Image 5) */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#00875a] p-4 text-white shadow-xl animate-bounce">
          <CheckCircle2 size={22} className="shrink-0 text-white" />
          <div className="pr-4">
            <p className="text-sm font-bold">Success!</p>
            <p className="text-xs text-emerald-100">Category "{name}" created successfully.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowToast(false)}
            className="text-emerald-200 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
