import {
  Bell,
  Bold,
  Calendar,
  Check,
  ChevronDown,
  Image as ImageIcon,
  Info,
  Italic,
  Link2,
  List,
  ListOrdered,
  Package,
  Plus,
  RotateCw,
  Save,
  Sliders,
  Tag,
  Trash2,
  Warehouse,
  X,
} from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import {
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

  // Weight & Packaging
  const [basePackSize, setBasePackSize] = useState('250')
  const [unit, setUnit] = useState('Grams (g)')
  const [variants, setVariants] = useState<string[]>([])
  const [newVariantInput, setNewVariantInput] = useState('')
  const [showAddVariant, setShowAddVariant] = useState(false)

  // Pricing
  const [mrp, setMrp] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [discount, setDiscount] = useState('0')
  const [taxRate, setTaxRate] = useState('5% GST')

  // Inventory
  const [stockQuantity, setStockQuantity] = useState('50')
  const [lowStockAlert, setLowStockAlert] = useState('10')
  const [inStock, setInStock] = useState(true)

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

    if (product.variants?.length) {
      const primary = product.variants[0]
      setSku(primary.sku || '')
      setSellingPrice(primary.price ? String(primary.price) : '')
      setMrp(primary.compareAtPrice ? String(primary.compareAtPrice) : '')
      setStockQuantity(String(product.variants.reduce((acc, v) => acc + (v.stock || 0), 0)))
      setInStock(product.variants.some((v) => (v.stock || 0) > 0))
      setVariants(product.variants.map((v) => v.label))
      setBasePackSize(primary.label || '250')
    } else {
      setSellingPrice(product.price ? String(product.price) : '')
      setVariants(['250g', '500g', '1kg'])
    }

    if (product.images?.length) {
      setMainImageUrl(product.images[0].url)
      setAdditionalImages(product.images.slice(1).map((img) => img.url))
    }
  }, [product])

  // Calculated final price (approx.)
  const numericPrice = parseFloat(sellingPrice) || 0
  const taxMultiplier = taxRate.includes('18%') ? 0.18 : taxRate.includes('12%') ? 0.12 : taxRate.includes('5%') ? 0.05 : 0
  const finalPrice = (numericPrice + numericPrice * taxMultiplier).toFixed(2)

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddVariant = () => {
    if (newVariantInput.trim() && !variants.includes(newVariantInput.trim())) {
      setVariants((prev) => [...prev, newVariantInput.trim()])
      setNewVariantInput('')
      setShowAddVariant(false)
    }
  }

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
      const url = URL.createObjectURL(file)
      setAdditionalImages((prev) => [...prev, url])
    }
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

      if (mainFile) {
        const formData = new FormData()
        formData.append('image', mainFile)
        formData.append('alt', name.trim())
        await uploadImage({ id, formData }).unwrap().catch(() => null)
      }

      toast.success(`Product "${name}" updated successfully!`)
      navigate('admin/products')
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to update product'
      toast.error(msg)
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
          <button
            type="button"
            className="relative grid size-9 place-items-center rounded-xl bg-white text-stone-600 shadow-sm ring-1 ring-stone-200/80 hover:bg-stone-50 transition-colors dark:bg-stone-900 dark:text-stone-300 dark:ring-stone-800"
            aria-label="Notifications"
          >
            <Bell size={16} />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500" />
          </button>
          <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-medium text-stone-600 shadow-sm ring-1 ring-stone-200/80 dark:bg-stone-900 dark:text-stone-300 dark:ring-stone-800">
            <Calendar size={14} className="text-stone-400" />
            <span>ID: {product.slug}</span>
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
              {additionalImages.length > 0 && (
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

            {/* Weight & Packaging Card */}
            <div className={`${card} p-5 space-y-4`}>
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3 dark:border-stone-800">
                <span className="grid size-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Package size={16} />
                </span>
                <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                  Weight & Packaging
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Base Pack Size
                  </label>
                  <input
                    type="text"
                    value={basePackSize}
                    onChange={(e) => setBasePackSize(e.target.value)}
                    className="w-full rounded-xl border-0 bg-stone-50 py-2 px-3 text-sm text-stone-800 ring-1 ring-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#24412a]/50 dark:bg-stone-800 dark:text-stone-100 dark:ring-stone-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Unit
                  </label>
                  <div className="relative">
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full appearance-none rounded-xl border-0 bg-stone-100/80 py-2 pl-3 pr-7 text-sm text-stone-700 ring-1 ring-stone-200 focus:bg-white focus:outline-none dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700"
                    >
                      <option value="Grams (g)">Grams (g)</option>
                      <option value="Kilograms (kg)">Kilograms (kg)</option>
                      <option value="Milliliters (ml)">Milliliters (ml)</option>
                      <option value="Liters (l)">Liters (l)</option>
                      <option value="Pieces">Pieces</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
                  Available Variants
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {variants.map((v, i) => (
                    <span
                      key={v}
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60"
                    >
                      {v}
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(i)}
                        className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-200"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  {showAddVariant ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        autoFocus
                        placeholder="e.g. 1kg"
                        value={newVariantInput}
                        onChange={(e) => setNewVariantInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddVariant())}
                        className="w-20 rounded-full border-0 bg-white py-0.5 px-2.5 text-xs ring-1 ring-emerald-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="grid size-6 place-items-center rounded-full bg-emerald-600 text-white"
                      >
                        <Check size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddVariant(true)}
                      className="inline-flex items-center gap-1 rounded-full border border-dashed border-stone-300 px-3 py-1 text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                    >
                      <Plus size={12} /> Add Variant
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Pricing, Inventory, Product Settings (3 Columns) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Card: Pricing */}
          <div className={`${card} p-5 space-y-4`}>
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3 dark:border-stone-800">
              <span className="grid size-7 place-items-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <Tag size={16} />
              </span>
              <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                Pricing
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  MRP
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">₹</span>
                  <input
                    type="text"
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    className="w-full rounded-xl border-0 bg-stone-50 py-2 pl-7 pr-3 text-sm font-medium text-stone-800 ring-1 ring-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#24412a]/50 dark:bg-stone-800 dark:text-stone-100 dark:ring-stone-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  SELLING PRICE
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">₹</span>
                  <input
                    type="text"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full rounded-xl border-0 bg-stone-50 py-2 pl-7 pr-3 text-sm font-medium text-stone-800 ring-1 ring-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#24412a]/50 dark:bg-stone-800 dark:text-stone-100 dark:ring-stone-700"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  DISCOUNT (%)
                </label>
                <input
                  type="text"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full rounded-xl border-0 bg-stone-50 py-2 px-3 text-sm font-medium text-stone-800 ring-1 ring-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#24412a]/50 dark:bg-stone-800 dark:text-stone-100 dark:ring-stone-700"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  TAX (GST)
                </label>
                <select
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full rounded-xl border-0 bg-stone-100/80 py-2 px-3 text-sm font-medium text-stone-700 ring-1 ring-stone-200 focus:bg-white focus:outline-none dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700"
                >
                  <option value="0% GST">0% GST</option>
                  <option value="5% GST">5% GST</option>
                  <option value="12% GST">12% GST</option>
                  <option value="18% GST">18% GST</option>
                </select>
              </div>
            </div>

            {/* Final Price approx container */}
            <div className="flex items-center justify-between rounded-xl bg-emerald-50/60 p-3 ring-1 ring-emerald-200/60 dark:bg-emerald-950/20 dark:ring-emerald-900/60">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Final Price (approx.)
              </span>
              <span className="text-lg font-bold text-stone-900 dark:text-stone-100">
                ₹{finalPrice}
              </span>
            </div>
          </div>

          {/* Card: Inventory */}
          <div className={`${card} p-5 space-y-4`}>
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3 dark:border-stone-800">
              <span className="grid size-7 place-items-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <Warehouse size={16} />
              </span>
              <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                Inventory
              </h2>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                STOCK QUANTITY
              </label>
              <input
                type="text"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full rounded-xl border-0 bg-stone-50 py-2 px-3 text-sm font-medium text-stone-800 ring-1 ring-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#24412a]/50 dark:bg-stone-800 dark:text-stone-100 dark:ring-stone-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                LOW STOCK ALERT
              </label>
              <input
                type="text"
                value={lowStockAlert}
                onChange={(e) => setLowStockAlert(e.target.value)}
                className="w-full rounded-xl border-0 bg-stone-50 py-2 px-3 text-sm font-medium text-stone-800 ring-1 ring-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#24412a]/50 dark:bg-stone-800 dark:text-stone-100 dark:ring-stone-700"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Stock Status
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInStock(!inStock)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    inStock ? 'bg-[#24412a]' : 'bg-stone-300 dark:bg-stone-700'
                  }`}
                >
                  <span
                    className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                      inStock ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                  {inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>

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
