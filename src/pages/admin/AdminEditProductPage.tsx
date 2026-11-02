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
import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { useAppDispatch } from '../../app/hooks'
import { VariantsEditor } from '../../components/admin/VariantsEditor'
import { syncVariants, toVariantRow, validateVariants, type VariantRow } from '../../components/admin/variants'
import { adminRepository } from '../../repositories/adminRepository'
import { errorMessage } from '../../lib/http/apiClient'
import {
  adminApi,
  useGetAdminCategoriesQuery,
  useGetAdminProductQuery,
  useUpdateAdminProductMutation,
  useUploadProductImageMutation,
} from '../../features/admin/adminApi'
import { card } from '../../components/admin/styles'
import { navigate } from '../../utils/router'
import '../../styles/admin.css'

export function AdminEditProductPage({ id }: { id: string }) {
  const { data: product, isLoading: isLoadingProduct, error } = useGetAdminProductQuery(id)
  const { data: categories = [] } = useGetAdminCategoriesQuery()
  const [updateProduct, { isLoading: isSaving }] = useUpdateAdminProductMutation()
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadProductImageMutation()
  const dispatch = useAppDispatch()

  // Form states
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sku, setSku] = useState('')
  const [shortDesc, setShortDesc] = useState('')
  const [fullDesc, setFullDesc] = useState('')

  // Images state
  const [mainImageUrl, setMainImageUrl] = useState<string>('')
  const [mainFile, setMainFile] = useState<File | null>(null)
  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  const [newViewFiles, setNewViewFiles] = useState<File[]>([])

  // Sizes / packs, each with its own price, MRP and stock
  const [variantRows, setVariantRows] = useState<VariantRow[]>([])

  // Product Settings
  const [customerFavorites, setCustomerFavorites] = useState(false)
  const [bestSellerTag, setBestSellerTag] = useState(false)
  const [trendingProducts, setTrendingProducts] = useState(false)
  const [publishStatus, setPublishStatus] = useState(true)

  // Pre-fill state when product data loads from backend
  useEffect(() => {
    if (!product) return

    setName(product.name ?? '')
    setCategoryId(product.categoryId ?? '')
    setShortDesc(product.subtitle ?? '')
    setFullDesc(product.description ?? '')
    setCustomerFavorites(product.isFeatured ?? false)
    setTrendingProducts(product.isTrending ?? false)
    setBestSellerTag(product.badge === 'Best Seller')
    setPublishStatus(product.isActive ?? true)

    setVariantRows([...product.variants].sort((a, b) => a.sortOrder - b.sortOrder).map(toVariantRow))
    setSku(product.variants[0]?.sku ?? '')

    if (product.images?.length) {
      setMainImageUrl(product.images[0].url)
      setAdditionalImages(product.images.slice(1).map((img) => img.url))
    }
  }, [product])

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
    if (file) {
      setAdditionalImages((prev) => [...prev, URL.createObjectURL(file)])
      setNewViewFiles((prev) => [...prev, file])
    }
    e.target.value = ''
  }

  const saveVariants = async () => {
    if (!product) return
    await syncVariants(adminRepository, id, product.variants, variantRows)
    dispatch(adminApi.util.invalidateTags([{ type: 'AdminProducts', id }, 'AdminProducts', 'Products', 'Dashboard']))
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
      const payload = {
        id,
        name: name.trim(),
        subtitle: shortDesc.trim() || undefined,
        description: fullDesc.trim() || undefined,
        categoryId: effectiveCatId,
        badge: bestSellerTag ? 'Best Seller' : customerFavorites ? 'Favorite' : null,
        isActive: publishStatus,
        isFeatured: customerFavorites,
        isTrending: trendingProducts,
      }

      await updateProduct(payload).unwrap()
      await saveVariants()

      // New photos are appended after the existing ones (manage order/removal per image later).
      const photos = [mainFile, ...newViewFiles].filter((file): file is File => Boolean(file))
      let failedUploads = 0
      for (const file of photos) {
        const formData = new FormData()
        formData.append('image', file)
        formData.append('alt', name.trim())
        await uploadImage({ id, formData }).unwrap().catch(() => { failedUploads += 1 })
      }
      if (failedUploads) toast.warning(`${failedUploads} photo(s) could not be uploaded.`)

      toast.success(`Product "${name}" updated successfully!`)
      navigate('admin/products')
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to update product'))
    }
  }

  if (isLoadingProduct) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-stone-500 font-medium">
          <RotateCw className="size-5 animate-spin text-[#1f7a55]" />
          <span>Loading product details...</span>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
        <p className="text-base font-bold text-stone-800">Product not found.</p>
        <p className="mt-2 text-sm text-stone-500">The product you are trying to edit does not exist.</p>
        <button
          type="button"
          onClick={() => navigate('admin/products')}
          className="mt-4 rounded-xl bg-[#24412a] px-4 py-2 text-xs font-semibold text-white"
        >
          Back to Products
        </button>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs font-medium text-stone-400 mb-1">
            <a href="#admin/products" className="hover:text-stone-600">Products</a>
            <span>/</span>
            <span className="text-stone-700 font-semibold truncate max-w-xs">{product.name}</span>
            <span>/</span>
            <span className="text-[#1f7a55]">Edit</span>
          </nav>
          <h1 className="font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-3xl">
            Edit Product
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-medium text-stone-600 shadow-sm ring-1 ring-stone-200/80 dark:bg-stone-900 dark:text-stone-300 dark:ring-stone-800">
            <span>/{product.slug}</span>
          </div>
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
                  Short Description (Listing Subtitle)
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
                <span className="text-[11px] text-stone-400">Max 5MB</span>
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
                    {mainImageUrl ? 'Replace main image' : 'Upload main image'}
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
              {product && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2.5">
                    GALLERY VIEWS
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {additionalImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative size-14 overflow-hidden rounded-xl bg-stone-100 ring-1 ring-stone-200/70"
                      >
                        <img src={img} alt={`View ${idx + 1}`} className="size-full object-cover" />
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
              )}
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
                <p className="text-[11px] text-stone-400">Display Best Seller badge</p>
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
            <a
              href={`#product/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white transition-colors"
            >
              View in Store
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isSaving || isUploadingImage}
              className="inline-flex items-center gap-2 rounded-xl bg-[#24412a] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#2d5034] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50"
            >
              <Save size={16} />
              {isSaving || isUploadingImage ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
