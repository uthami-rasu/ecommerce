import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ArrowRight, Heart, Loader2, Minus, Plus, Search, ShoppingBag, Trash2, X } from 'lucide-react'
import { Footer } from '../components/layout/Footer'
import { ProductImage } from '../components/catalog/ProductImage'
import { useQuickAdd } from '../components/catalog/useQuickAdd'
import { useCart } from '../hooks/useCart'
import { useWishlist } from '../hooks/useWishlist'
import type { CartLine, ProductSummary } from '../types/api'
import { formatMoney } from '../utils/format'
import '../styles/catalog.css'

const ALL = 'All'

function VaultCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-white/60 bg-white shadow-md dark:border-stone-800 dark:bg-stone-900 sm:rounded-[2rem]" aria-hidden="true">
      <span className="catalog-skeleton block aspect-[4/3]" />
      <div className="flex items-center justify-between gap-3 px-4 py-3.5"><span className="catalog-skeleton block h-5 w-16 rounded-full" /><span className="catalog-skeleton block h-8 w-16 rounded-xl" /></div>
    </div>
  )
}

type VaultCardProps = {
  product: ProductSummary
  lines: CartLine[]
  adding: boolean
  onAdd: () => void
  onRemove: () => void
  onQuantity: (line: CartLine, quantity: number) => void
  onRemoveLine: (line: CartLine) => void
}

function VaultCard({ product, lines, adding, onAdd, onRemove, onQuantity, onRemoveLine }: VaultCardProps) {
  const cartQty = lines.reduce((sum, line) => sum + line.quantity, 0)
  const single = lines.length === 1 ? lines[0] : null

  return (
    <article className="group flex flex-col overflow-hidden rounded-[1.5rem] border border-white/60 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-stone-800/80 dark:bg-stone-900 sm:rounded-[2rem]">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#efe7da] dark:bg-stone-800">
        <a href={`#product/${product.slug}`} tabIndex={-1} aria-hidden="true">
          <ProductImage className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-110" image={product.image} alt={product.name} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" />
        </a>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <span className="absolute left-3 top-3 max-w-[calc(100%-4rem)] truncate rounded-xl border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
          {product.category.name}
        </span>

        <button
          type="button"
          onClick={onRemove}
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-xl border border-white/20 bg-black/30 text-white/80 backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-transparent hover:bg-rose-500/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label={`Remove ${product.name} from your wishlist`}
        >
          <Trash2 size={13} />
        </button>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-4 pb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">{product.sizes.join(' · ')}</p>
          <h3 className="line-clamp-2 font-display text-sm font-black leading-snug text-white sm:text-base">
            <a className="pointer-events-auto hover:underline" href={`#product/${product.slug}`}>{product.name}</a>
          </h3>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-between gap-2 px-3 py-3.5 sm:px-4">
        <div className="min-w-0">
          <p className="text-base font-bold leading-none tabular-nums text-[#173f32] dark:text-amber-400">{formatMoney(product.price)}</p>
          <p className={`mt-1 text-[10px] font-semibold ${product.inStock ? 'text-[#4f7f46] dark:text-emerald-400' : 'text-[#b94738] dark:text-rose-400'}`}>
            {product.inStock ? 'In stock' : 'Sold out'}
          </p>
        </div>

        {cartQty === 0 ? (
          <button
            type="button"
            onClick={onAdd}
            disabled={adding || !product.inStock}
            aria-busy={adding}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#173f32] px-3.5 py-2 text-xs font-black text-white shadow-md shadow-[#173f32]/20 transition-all hover:scale-105 hover:bg-[#1e5040] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            aria-label={product.inStock ? `Add ${product.name} to cart` : `${product.name} is sold out`}
          >
            {adding ? <Loader2 className="animate-spin" size={12} /> : <Plus size={12} strokeWidth={3} />} {product.inStock ? 'Add' : 'Sold out'}
          </button>
        ) : single ? (
          <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-100 px-2 py-1.5 dark:border-stone-700 dark:bg-stone-800" role="group" aria-label={`${product.name} quantity in cart`}>
            <button
              type="button"
              onClick={() => (single.quantity <= 1 ? onRemoveLine(single) : onQuantity(single, single.quantity - 1))}
              className="grid size-6 place-items-center rounded-lg bg-white text-stone-800 transition hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-200"
              aria-label={single.quantity <= 1 ? 'Remove from cart' : 'Decrease quantity'}
            >
              <Minus size={11} strokeWidth={2.5} />
            </button>
            <span className="w-5 text-center text-sm font-black text-stone-900 dark:text-stone-100" aria-live="polite">{single.quantity}</span>
            <button
              type="button"
              onClick={() => onQuantity(single, single.quantity + 1)}
              disabled={single.quantity >= single.maxQuantity}
              className="grid size-6 place-items-center rounded-lg bg-white text-stone-800 transition hover:bg-stone-200 disabled:opacity-40 dark:bg-stone-700 dark:text-stone-200"
              aria-label="Increase quantity"
            >
              <Plus size={11} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <a className="shrink-0 rounded-xl bg-stone-100 px-3 py-2 text-[11px] font-bold text-[#173f32] transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-100" href="#cart">{cartQty} in cart</a>
        )}
      </div>
    </article>
  )
}

export function WishlistPage() {
  const { items, isLoading, toggle } = useWishlist()
  const { cart, setQuantity, remove } = useCart()
  const { quickAdd, isAdding } = useQuickAdd()
  const [selectedCategory, setSelectedCategory] = useState(ALL)
  const [searchQuery, setSearchQuery] = useState('')
  const [addingAll, setAddingAll] = useState(false)

  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    items.forEach((item) => counts.set(item.category.name, (counts.get(item.category.name) ?? 0) + 1))
    return [{ name: ALL, count: items.length }, ...Array.from(counts, ([name, count]) => ({ name, count }))]
  }, [items])
  const activeCategory = categories.some((item) => item.name === selectedCategory) ? selectedCategory : ALL

  const filteredProducts = useMemo(() => {
    const term = searchQuery.trim().toLowerCase()
    return items.filter((product) =>
      (activeCategory === ALL || product.category.name === activeCategory) &&
      (!term || `${product.name} ${product.category.name}`.toLowerCase().includes(term)))
  }, [items, activeCategory, searchQuery])

  const linesFor = (productId: string) => (cart?.items ?? []).filter((line) => line.productId === productId)
  const addable = filteredProducts.filter((product) => product.inStock && linesFor(product.id).length === 0)
  const cartCount = cart?.itemCount ?? 0

  const addAllToCart = async () => {
    if (!addable.length) {
      toast.info('Everything here is already in your cart')
      return
    }
    setAddingAll(true)
    let added = 0
    // Sequential so the server cart applies each line in order.
    for (const product of addable) {
      if (await quickAdd(product, 1, { silent: true })) added += 1
    }
    setAddingAll(false)
    if (added) toast.success(`${added} item${added === 1 ? '' : 's'} added to your cart`, { action: { label: 'View cart', onClick: () => { window.location.hash = 'cart' } } })
  }

  const searchInput = (className: string, id: string) => (
    <div className={`relative ${className}`}>
      <label className="sr-only" htmlFor={id}>Search your wishlist</label>
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={13} aria-hidden="true" />
      <input
        id={id}
        type="text"
        inputMode="search"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Search vault…"
        className="h-9 w-full rounded-full border border-stone-200/80 bg-stone-100/60 pl-8 pr-8 text-xs font-semibold text-stone-900 transition placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 sm:w-52"
      />
      {searchQuery && (
        <button type="button" onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-full text-stone-400 hover:text-stone-700" aria-label="Clear search"><X size={12} /></button>
      )}
    </div>
  )

  const addAllButton = (className: string, label: string) => (
    <button
      type="button"
      onClick={addAllToCart}
      disabled={addingAll || !addable.length}
      className={`flex items-center justify-center gap-2 bg-amber-400 font-black text-stone-950 transition-all hover:scale-105 hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173f32] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 ${className}`}
    >
      {addingAll ? <Loader2 className="animate-spin" size={14} /> : <ShoppingBag size={14} />} {label}
    </button>
  )

  return (
    <>
      <main className="wishlist-page relative min-h-screen overflow-x-hidden bg-[#f7f4ef] dark:bg-[#0d0d0d]">
        <div className="pointer-events-none absolute -left-60 -top-60 size-[800px] rounded-full bg-amber-300/20 blur-[140px] dark:bg-amber-500/8" />
        <div className="pointer-events-none absolute -right-60 top-1/2 size-[600px] rounded-full bg-emerald-300/15 blur-[110px] dark:bg-emerald-600/8" />

        <div className="relative z-10 border-b border-black/5 bg-white/70 backdrop-blur-2xl dark:border-white/5 dark:bg-[#0d0d0d]/80">
          <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-10">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-300/40">
                <Heart size={16} className="fill-white text-white" />
              </div>
              <div>
                <h1 className="font-display text-lg font-black leading-none text-[#173f32] dark:text-stone-100 sm:text-xl">My Vault</h1>
                <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400" aria-live="polite">
                  {isLoading ? 'Loading…' : `${items.length} saved item${items.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {items.length > 0 && searchInput('hidden sm:block', 'vault-search')}
              {cartCount > 0 && cart && (
                <a href="#cart" className="flex items-center gap-2 rounded-full bg-[#173f32] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-[#173f32]/30 transition-all hover:scale-105 hover:bg-[#1e5040]" aria-label={`View cart: ${cartCount} items, ${formatMoney(cart.subtotal)}`}>
                  <ShoppingBag size={13} className="text-amber-300" />
                  <span>{formatMoney(cart.subtotal)}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-[1440px] px-5 py-8 sm:px-10">
          {items.length > 0 && searchInput('mb-5 sm:hidden', 'vault-search-mobile')}

          {items.length > 0 && (
            <div className="mb-7 flex flex-wrap items-center gap-2.5">
              {categories.map((category) => {
                const isActive = activeCategory === category.name
                return (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() => setSelectedCategory(category.name)}
                    aria-pressed={isActive}
                    className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                      isActive
                        ? 'scale-105 border-transparent bg-[#173f32] text-amber-300 shadow-lg shadow-[#173f32]/20'
                        : 'border-stone-200/80 bg-white text-stone-600 hover:border-amber-400/60 hover:text-amber-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400 dark:hover:text-amber-400'
                    }`}
                  >
                    {category.name}
                    <span className={`rounded-lg px-1.5 py-0.5 text-[10px] font-black ${isActive ? 'bg-amber-400/25 text-amber-200' : 'bg-stone-100 text-stone-500 dark:bg-stone-800'}`}>{category.count}</span>
                  </button>
                )
              })}

              {addable.length > 0 && <div className="flex w-full sm:ml-auto sm:w-auto">{addAllButton('w-full rounded-2xl px-5 py-2.5 text-xs shadow-lg shadow-amber-300/30 sm:w-auto', `Add all (${addable.length})`)}</div>}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4" role="status" aria-label="Loading your wishlist">
              {Array.from({ length: 4 }, (_, index) => <VaultCardSkeleton key={index} />)}
            </div>
          ) : items.length === 0 ? (
            <div className="py-24 text-center">
              <div className="mx-auto mb-8 grid size-28 rotate-12 place-items-center rounded-[2.5rem] bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 shadow-2xl shadow-amber-200/50 dark:shadow-amber-900/30">
                <Heart size={52} className="-rotate-12 fill-white text-white" />
              </div>
              <h2 className="font-display text-4xl font-black text-[#173f32] dark:text-stone-100">Nothing saved yet</h2>
              <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-stone-500 dark:text-stone-400">
                Tap the ♡ heart on any jar or snack while browsing to save it to your personal vault.
              </p>
              <a href="#shop" className="mt-8 inline-flex items-center gap-2.5 rounded-2xl bg-[#173f32] px-9 py-4 text-sm font-black text-white shadow-xl shadow-[#173f32]/30 transition hover:scale-105 hover:bg-[#1e5040]">
                Explore the shop <ArrowRight size={16} />
              </a>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-stone-300 py-20 text-center dark:border-stone-700">
              <p className="font-display text-2xl font-bold text-[#173f32] dark:text-stone-100">No saved items match</p>
              <p className="mt-2 text-sm text-stone-500">Try another word or category.</p>
              <button type="button" className="mt-5 rounded-full bg-[#173f32] px-5 py-2.5 text-xs font-bold text-white" onClick={() => { setSearchQuery(''); setSelectedCategory(ALL) }}>Show everything</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <VaultCard
                  key={product.id}
                  product={product}
                  lines={linesFor(product.id)}
                  adding={isAdding(product.id)}
                  onAdd={() => quickAdd(product)}
                  onRemove={() => toggle(product)}
                  onQuantity={(line, quantity) => setQuantity(line, quantity)}
                  onRemoveLine={(line) => remove(line)}
                />
              ))}
            </div>
          )}

          {filteredProducts.length > 0 && (
            <div className="relative mt-14 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0f2e22] via-[#173f32] to-[#0f2e22] p-8 shadow-2xl shadow-[#173f32]/30 sm:p-10">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,_#f59e0b_1px,_transparent_1px)] bg-[length:24px_24px] opacity-10" />
              <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400/70">Ready to checkout?</p>
                  <h2 className="font-display text-2xl font-black leading-tight text-white sm:text-4xl">
                    {filteredProducts.length} treasure{filteredProducts.length > 1 ? 's' : ''} waiting in your vault
                  </h2>
                  <p className="mt-2 text-sm text-white/50">{addable.length ? 'Add everything at once and save time at checkout.' : 'Everything here is already in your cart.'}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-3">
                  {addable.length > 0 && addAllButton('rounded-2xl px-7 py-3.5 text-sm shadow-xl shadow-black/30', 'Add all to cart')}
                  <a href="#cart" className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-7 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/20">
                    View cart <ArrowRight size={15} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
