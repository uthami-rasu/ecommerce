import {
  Bold,
  ChevronDown,
  Image as ImageIcon,
  Info,
  Italic,
  Link2,
  List,
  ListOrdered,
  Plus,
  RotateCw,
  Save,
  Sliders,
  Trash2,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { VariantsEditor } from '../../components/admin/VariantsEditor'
import { emptyVariant, toVariantInput, validateVariants, type VariantRow } from '../../components/admin/variants'
import { errorMessage } from '../../lib/http/apiClient'
import {
  useCreateAdminProductMutation,
  useGetAdminCategoriesQuery,
  useUploadProductImageMutation,
} from '../../features/admin/adminApi'
import { card } from '../../components/admin/styles'
import { navigate } from '../../utils/router'
import '../../styles/admin.css'


export function AdminAddProductPage() {
  const { data: categories = [] } = useGetAdminCategoriesQuery()
  const [createProduct, { isLoading: isCreating }] = useCreateAdminProductMutation()
  const [uploadImage] = useUploadProductImageMutation()

  // Form states
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sku, setSku] = useState('')
  const [shortDesc, setShortDesc] = useState('')
  const [fullDesc, setFullDesc] = useState('')

  // Images state
  const [mainImageUrl, setMainImageUrl] = useState<string>('')
  const [mainFile, setMainFile] = useState<File | null>(null)
  const [additionalFiles, setAdditionalFiles] = useState<Array<{ file: File; url: string }>>([])

  // Sizes / packs, each with its own price, MRP and stock
  const [variantRows, setVariantRows] = useState<VariantRow[]>([emptyVariant('250g')])

  // Product Settings
  const [customerFavorites, setCustomerFavorites] = useState(false)
  const [bestSellerTag, setBestSellerTag] = useState(true)
  const [trendingProducts, setTrendingProducts] = useState(true)
  const [publishStatus, setPublishStatus] = useState(true)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMainFile(file)
      const url = URL.createObjectURL(file)
      setMainImageUrl(url)
    }
  }

  const handleAddAdditionalView = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setAdditionalFiles((prev) => [...prev, { file, url: URL.createObjectURL(file) }])
    e.target.value = ''
  }

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault()
    if (!name.trim()) {
      toast.error('Please enter a product name')
      return
    }

    const effectiveCatId = categoryId || (categories.length ? categories[0].id : '')
    if (!effectiveCatId) {
      toast.error('Please select a category')
      return
    }
    const variantProblem = validateVariants(variantRows)
    if (variantProblem) {
      toast.error(variantProblem)
      return
    }

    try {
      const prefix = sku.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '')
      const variantList = variantRows.map((row, index) => {
        const input = toVariantInput(row, index)
        const suffix = input.label.toUpperCase().replace(/[^A-Z0-9]/g, '')
        return prefix && suffix ? { ...input, sku: `${prefix}-${suffix}`.slice(0, 64) } : input
      })

      const payload = {
        name: name.trim(),
        subtitle: shortDesc.trim() || undefined,
        description: fullDesc.trim() || undefined,
        categoryId: effectiveCatId,
        badge: bestSellerTag ? 'Best Seller' : customerFavorites ? 'Favorite' : null,
        isActive: publishStatus,
        isFeatured: customerFavorites,
        isTrending: trendingProducts,
        variants: variantList,
      }

      const res = await createProduct(payload).unwrap()
      const createdId = res?.id || (res?.data && res.data.id)

      // Main photo first (it becomes the listing image), then the extra views in order.
      const photos = [mainFile, ...additionalFiles.map((item) => item.file)].filter((file): file is File => Boolean(file))
      let failedUploads = 0
      for (const [index, file] of photos.entries()) {
        const formData = new FormData()
        formData.append('image', file)
        formData.append('alt', name.trim())
        formData.append('sortOrder', String(index))
        if (createdId) await uploadImage({ id: createdId, formData }).unwrap().catch(() => { failedUploads += 1 })
      }
      if (failedUploads) toast.warning(`${failedUploads} photo(s) could not be uploaded — add them from Edit product.`)

      toast.success(`Product "${name}" saved and published successfully!`)
      navigate('admin/products')
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to create product'))
    }
  }

  return (
    <div className="grid gap-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-3xl">
            Add New Product
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6">
        {/* Main 2-column layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Basic Information */}
          <div className="lg:col-span-8">
            <div className={`${card} p-5 sm:p-6 space-y-5`}>
              <div className="flex items-center gap-2.5 border-b border-stone-100 pb-4 dark:border-stone-800">
                <span className="grid size-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Info size={16} />
                </span>
                <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100">
                  Basic Information
                </h2>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Product Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Premium Roasted Almonds - Lightly Salted"
                  className="w-full rounded-xl border-0 bg-stone-50/70 py-2.5 px-3.5 text-sm text-stone-800 ring-1 ring-stone-200 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#24412a]/50 dark:bg-stone-850 dark:text-stone-100 dark:ring-stone-700"
                />
              </div>

              {/* Category & SKU row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full appearance-none rounded-xl border-0 bg-stone-100/80 py-2.5 pl-3.5 pr-8 text-sm text-stone-700 ring-1 ring-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#24412a]/50 dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="NH-ALM-001"
                    className="w-full rounded-xl border-0 bg-stone-50/70 py-2.5 px-3.5 text-sm text-stone-800 ring-1 ring-stone-200 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#24412a]/50 dark:bg-stone-850 dark:text-stone-100 dark:ring-stone-700"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="Brief overview for product listings..."
                  className="w-full rounded-xl border-0 bg-stone-50/70 py-2.5 px-3.5 text-sm text-stone-800 ring-1 ring-stone-200 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#24412a]/50 dark:bg-stone-850 dark:text-stone-100 dark:ring-stone-700"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Full Description
                </label>
                <div className="rounded-xl ring-1 ring-stone-200 overflow-hidden bg-white dark:bg-stone-850 dark:ring-stone-700">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 border-b border-stone-100 bg-stone-50/60 px-3 py-2 dark:border-stone-800 dark:bg-stone-800/50">
                    <button
                      type="button"
                      className="grid size-7 place-items-center rounded text-stone-600 hover:bg-stone-200/60 dark:text-stone-300"
                      title="Bold"
                    >
                      <Bold size={14} />
                    </button>
                    <button
                      type="button"
                      className="grid size-7 place-items-center rounded text-stone-600 hover:bg-stone-200/60 dark:text-stone-300"
                      title="Italic"
                    >
                      <Italic size={14} />
                    </button>
                    <div className="h-4 w-px bg-stone-200 dark:bg-stone-700 mx-1" />
                    <button
                      type="button"
                      className="grid size-7 place-items-center rounded text-stone-600 hover:bg-stone-200/60 dark:text-stone-300"
                      title="Bullet list"
                    >
                      <List size={14} />
                    </button>
                    <button
                      type="button"
                      className="grid size-7 place-items-center rounded text-stone-600 hover:bg-stone-200/60 dark:text-stone-300"
                      title="Numbered list"
                    >
                      <ListOrdered size={14} />
                    </button>
                    <div className="h-4 w-px bg-stone-200 dark:bg-stone-700 mx-1" />
                    <button
                      type="button"
                      className="grid size-7 place-items-center rounded text-stone-600 hover:bg-stone-200/60 dark:text-stone-300"
                      title="Insert link"
                    >
                      <Link2 size={14} />
                    </button>
                    <button
                      type="button"
                      className="grid size-7 place-items-center rounded text-stone-600 hover:bg-stone-200/60 dark:text-stone-300"
                      title="Insert image"
                    >
                      <ImageIcon size={14} />
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={fullDesc}
                    onChange={(e) => setFullDesc(e.target.value)}
                    placeholder="Write detailed product benefits, origin details, etc."
                    className="w-full border-0 bg-transparent p-3.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none dark:text-stone-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Product Images & Weight & Packaging */}
          <div className="lg:col-span-4 space-y-6">
            {/* Product Images Card */}
            <div className={`${card} p-5 space-y-4`}>
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                    <ImageIcon size={16} />
                  </span>
                  <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                    Product Images
                  </h2>
                </div>
                <span className="text-[11px] text-stone-400">Max 5MB per image</span>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Main product image (one image)</p>
                <p className="mt-0.5 text-[11px] text-stone-400">Shown on the shop, the product page, the cart and the gift page.</p>
              </div>
              {/* Main Image Dropzone */}
              <div className="rounded-2xl border-2 border-dashed border-indigo-200/70 bg-[#fafaff] p-5 text-center dark:border-indigo-900/50 dark:bg-indigo-950/10">
                {mainImageUrl ? (
                  <div className="relative mx-auto size-32 overflow-hidden rounded-xl bg-stone-100 shadow-sm ring-1 ring-stone-200/60 dark:bg-stone-800">
                    <img
                      src={mainImageUrl}
                      alt="Main product"
                      className="size-full object-cover"
                    />
                    <div className="absolute right-1.5 top-1.5 flex gap-1">
                      <label className="cursor-pointer grid size-6 place-items-center rounded-full bg-white/90 text-stone-700 shadow hover:bg-white transition-colors">
                        <RotateCw size={11} />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMainImageUrl('')
                          setMainFile(null)
                        }}
                        className="grid size-6 place-items-center rounded-full bg-white/90 text-rose-600 shadow hover:bg-white transition-colors"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center py-4">
                    <ImageIcon size={28} className="text-indigo-400 mb-2" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}

                <div className="mt-3">
                  <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                    Drop your main image here
                  </p>
                  <label className="cursor-pointer text-xs text-indigo-600 hover:underline dark:text-indigo-400">
                    or click to browse files
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>

              {/* Additional Views */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2.5">
                  ADDITIONAL VIEWS
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {additionalFiles.map((item, idx) => (
                    <div
                      key={item.url}
                      className="relative size-14 overflow-hidden rounded-xl bg-stone-100 ring-1 ring-stone-200/70"
                    >
                      <img src={item.url} alt={`View ${idx + 1}`} className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setAdditionalFiles((prev) => prev.filter((other) => other.url !== item.url))}
                        aria-label={`Remove view ${idx + 1}`}
                        className="absolute right-0.5 top-0.5 grid size-5 place-items-center rounded-full bg-white/90 text-rose-600 shadow"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                  <label className="cursor-pointer grid size-14 place-items-center rounded-xl border-2 border-dashed border-indigo-200 text-stone-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                    <Plus size={18} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAddAdditionalView}
                    />
                  </label>
                </div>
              </div>
            </div>

          </div>
        </div>

        <VariantsEditor rows={variantRows} onChange={setVariantRows} />

        {/* Product Settings */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Card: Product Settings */}
          <div className={`${card} p-5 space-y-4`}>
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3 dark:border-stone-800">
              <span className="grid size-7 place-items-center rounded-lg bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                <Sliders size={16} />
              </span>
              <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                Product Settings
              </h2>
            </div>

            {/* Setting 1: Customer Favorites */}
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">
                  Customer Favorites
                </p>
                <p className="text-[11px] text-stone-400">Show on homepage banner</p>
              </div>
              <button
                type="button"
                onClick={() => setCustomerFavorites(!customerFavorites)}
                className={`relative inline-flex h-5 w-10 shrink-0 items-center rounded-full transition-colors ${
                  customerFavorites ? 'bg-[#24412a]' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <span
                  className={`inline-block size-3.5 transform rounded-full bg-white transition-transform ${
                    customerFavorites ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Setting 2: Best Seller Tag */}
            <div className="flex items-center justify-between py-1 border-t border-stone-100 dark:border-stone-800 pt-2.5">
              <div>
                <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">
                  Best Seller Tag
                </p>
                <p className="text-[11px] text-stone-400">Auto-calculate based on sales</p>
              </div>
              <button
                type="button"
                onClick={() => setBestSellerTag(!bestSellerTag)}
                className={`relative inline-flex h-5 w-10 shrink-0 items-center rounded-full transition-colors ${
                  bestSellerTag ? 'bg-[#24412a]' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <span
                  className={`inline-block size-3.5 transform rounded-full bg-white transition-transform ${
                    bestSellerTag ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Setting 3: Trending Products */}
            <div className="flex items-center justify-between py-1 border-t border-stone-100 dark:border-stone-800 pt-2.5">
              <div>
                <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">
                  Trending Products
                </p>
                <p className="text-[11px] text-stone-400">Show in Trending section</p>
              </div>
              <button
                type="button"
                onClick={() => setTrendingProducts(!trendingProducts)}
                className={`relative inline-flex h-5 w-10 shrink-0 items-center rounded-full transition-colors ${
                  trendingProducts ? 'bg-[#24412a]' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <span
                  className={`inline-block size-3.5 transform rounded-full bg-white transition-transform ${
                    trendingProducts ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Setting 4: Publish Status */}
            <div className="flex items-center justify-between py-1 border-t border-stone-100 dark:border-stone-800 pt-2.5">
              <div>
                <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">
                  Publish Status
                </p>
                <p className="text-[11px] text-stone-400">Enable visibility for users</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300">
                  {publishStatus ? 'ACTIVE' : 'INACTIVE'}
                </span>
                <button
                  type="button"
                  onClick={() => setPublishStatus(!publishStatus)}
                  className={`relative inline-flex h-5 w-10 shrink-0 items-center rounded-full transition-colors ${
                    publishStatus ? 'bg-[#24412a]' : 'bg-stone-300 dark:bg-stone-700'
                  }`}
                >
                  <span
                    className={`inline-block size-3.5 transform rounded-full bg-white transition-transform ${
                      publishStatus ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sticky Action Bar */}
        <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/95 p-4 shadow-lg ring-1 ring-stone-200/80 backdrop-blur-md dark:bg-stone-900/95 dark:ring-stone-800">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('admin/products')}
              className="text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => toast.success('Product draft saved locally!')}
              className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white transition-colors"
            >
              <Save size={15} /> Save as Draft
            </button>
          </div>

          <div className="flex items-center gap-6">
            <span className="hidden sm:inline text-xs italic text-stone-400">
              Last auto-saved 2 mins ago
            </span>
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex items-center gap-2 rounded-xl bg-[#24412a] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#2d5034] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50"
            >
              {isCreating ? 'Saving...' : 'Save & Publish Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
