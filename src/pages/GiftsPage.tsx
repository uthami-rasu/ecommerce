import { useState } from 'react'
import { Check, Loader2, MessageCircle, Phone, RotateCcw, Gift, ShoppingBag } from 'lucide-react'
import { Footer } from '../components/layout/Footer'
import { useQuickAdd } from '../components/catalog/useQuickAdd'
import { GiftIconView } from '../components/gifts/giftIcons'
import { useGetGiftPageQuery } from '../features/gifting/giftingApi'
import { errorMessage } from '../lib/http/apiClient'
import type { GiftDesignView, ProductSummary } from '../types/api'
import { formatMoney } from '../utils/format'
import heroFallback from '../assets/images/unsplash-dry-fruit-bowls.webp'
import introMain from '../assets/gifting/intro-main.webp'
import introAccent from '../assets/gifting/intro-accent.webp'
import nutsScatter from '../assets/gifting/nuts-scatter.webp'
import collection1 from '../assets/gifting/collection-1.webp'
import collection2 from '../assets/gifting/collection-2.webp'
import collection3 from '../assets/gifting/collection-3.webp'
import moment1 from '../assets/gifting/moment-1.webp'
import moment2 from '../assets/gifting/moment-2.webp'
import moment3 from '../assets/gifting/moment-3.webp'
import moment4 from '../assets/gifting/moment-4.webp'
import ctaFallback from '../assets/images/unsplash-pistachio.webp'

/** Shown until the admin uploads their own photo for that slot. */
const COLLECTION_FALLBACKS = [collection1, collection2, collection3]
const MOMENT_FALLBACKS = [moment1, moment2, moment3, moment4]

const PAGE_BG = 'bg-[#f8f5ef] dark:bg-stone-950'

export function GiftsPage() {
  const { data, isLoading, error, refetch } = useGetGiftPageQuery()

  if (isLoading) return <main className={`${PAGE_BG} min-h-[80vh] animate-pulse`} role="status" aria-label="Loading gift collections" />
  if (!data) {
    return (
      <main className="grid min-h-[60vh] place-items-center px-6 text-center">
        <div role="alert">
          <Gift className="mx-auto text-[#b9773a]" size={36} />
          <h1 className="mt-4 font-display text-3xl font-bold text-[#173f32] dark:text-stone-100">We couldn’t load the gift collections</h1>
          <p className="mt-2 text-sm text-stone-500">{errorMessage(error)}</p>
          <button type="button" onClick={refetch} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#173f32] px-6 py-2.5 text-sm font-bold text-white">
            <RotateCcw size={14} /> Try again
          </button>
        </div>
      </main>
    )
  }

  const { design } = data
  return (
    <main className={PAGE_BG}>
      <Hero hero={design.hero} />
      <Intro intro={design.intro} />
      {design.collections.map((collection, index) => (
        <Collection key={index} index={index} collection={collection} />
      ))}
      <Moments moments={design.moments} />
      <Pillars pillars={design.pillars} />
      <Journey journey={design.journey} />
      <QuoteBanner cta={design.cta} hero={design.hero} />
      <Footer />
    </main>
  )
}

// ── Hero ─────────────────────────────────────────────────

function Hero({ hero }: { hero: GiftDesignView['hero'] }) {
  const whatsapp = `https://wa.me/${hero.whatsappNumber}${hero.whatsappMessage ? `?text=${encodeURIComponent(hero.whatsappMessage)}` : ''}`
  return (
    <section className="relative isolate overflow-hidden">
      <img src={hero.imageUrl ?? heroFallback} alt="" className="absolute inset-0 -z-20 size-full object-cover" fetchPriority="high" />
      <div className="absolute inset-0 -z-10 bg-black/55" aria-hidden />
      <div className="mx-auto flex min-h-[440px] max-w-6xl flex-col items-center justify-center px-5 py-24 text-center text-white sm:min-h-[520px]">
        {hero.eyebrow && <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8fc45a] sm:text-sm">{hero.eyebrow}</p>}
        <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] sm:text-6xl">{hero.title}</h1>
        {hero.subtitle && <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-lg">{hero.subtitle}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={`tel:${hero.phone.replace(/[^\d+]/g, '')}`} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#4f7f46] px-7 text-sm font-bold text-white ring-1 ring-white/30 transition hover:bg-[#5d9152]">
            {hero.callLabel} <Phone size={15} />
          </a>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-bold text-stone-900 transition hover:bg-stone-100">
            {hero.whatsappLabel} <MessageCircle size={15} />
          </a>
        </div>
      </div>
    </section>
  )
}

// ── The Art of Thoughtful Gifting ────────────────────────

function Intro({ intro }: { intro: GiftDesignView['intro'] }) {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <img src={nutsScatter} alt="" aria-hidden className="pointer-events-none absolute -right-6 top-0 w-40 opacity-90 sm:w-64 dark:opacity-40" />
      <img src={nutsScatter} alt="" aria-hidden className="pointer-events-none absolute -bottom-6 -left-8 w-36 rotate-180 opacity-90 sm:w-56 dark:opacity-40" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        {/* Main photo with the accent photo overlapping its top-right corner, as in the design. */}
        <div className="relative mx-auto w-full max-w-xl pt-[10%]">
          <div className="relative">
            <img src={intro.imageUrl ?? introMain} alt="" loading="lazy" className="aspect-[1250/1202] w-full rounded-tl-[22%] rounded-br-[22%] object-cover" />
            <img
              src={intro.accentImageUrl ?? introAccent}
              alt=""
              loading="lazy"
              className="absolute left-[67.6%] top-[-10%] aspect-square w-[41%] rounded-bl-[30%] object-cover shadow-xl"
            />
          </div>
        </div>
        <div>
          <h2 className="max-w-md font-display text-4xl font-medium leading-[1.05] text-stone-900 sm:text-6xl dark:text-stone-50">{intro.title}</h2>
          <ul className="mt-10 grid gap-8">
            {intro.points.map((point, index) => (
              <li key={`${point.title}-${index}`} className="flex gap-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-full ring-1 ring-[#c9a46a] text-[#b8893f]">
                  <GiftIconView name={point.icon} size={16} />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-900 dark:text-stone-100">{point.title}</p>
                  {point.body && <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">{point.body}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

// ── Collections ──────────────────────────────────────────

type CollectionView = GiftDesignView['collections'][number]

/** Light (image left), wine (image right) and dark (centred), in that order — as in the design. */
const THEMES = [
  { section: 'bg-[#ece9e2] dark:bg-stone-900', eyebrow: 'text-[#b8893f]', title: 'italic text-stone-900 dark:text-stone-50', body: 'text-stone-600 dark:text-stone-300', price: 'text-stone-800 dark:text-stone-200', button: 'border border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white dark:border-stone-200 dark:text-stone-100', pill: 'border-stone-300 text-stone-700 hover:border-stone-900 dark:border-stone-600 dark:text-stone-200', pillOn: 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900' },
  { section: 'bg-[#5f1e33]', eyebrow: 'text-[#d9b27c]', title: 'italic text-white', body: 'text-white/75', price: 'text-white', button: 'border border-[#c9a46a] text-white hover:bg-[#c9a46a] hover:text-[#5f1e33]', pill: 'border-white/25 text-white/80 hover:border-[#c9a46a]', pillOn: 'border-[#c9a46a] bg-[#c9a46a] text-[#5f1e33]' },
  { section: 'bg-[#161412]', eyebrow: 'text-[#c9a46a]', title: 'text-white', body: 'italic text-stone-300', price: 'text-white', button: 'bg-white text-stone-950 hover:bg-[#f3e6cf]', pill: 'border-white/25 text-white/80 hover:border-white', pillOn: 'border-white bg-white text-stone-950' },
] as const

function Collection({ index, collection }: { index: number; collection: CollectionView }) {
  const theme = THEMES[index] ?? THEMES[0]
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const selected = collection.products.find((p) => p.id === selectedId) ?? collection.products[0] ?? null
  const image = collection.imageUrl ?? COLLECTION_FALLBACKS[index] ?? selected?.image?.url ?? collection1
  const eyebrow = `${String(index + 1).padStart(2, '0')} / Collection`
  const href = selected ? `#product/${selected.slug}` : undefined
  const photo = (
    <a href={href} tabIndex={href ? undefined : -1} aria-hidden={!href} className={`block overflow-hidden ${href ? '' : 'pointer-events-none'}`}>
      <img src={image} alt={collection.title} loading="lazy" className="aspect-[3/2] w-full object-cover transition duration-700 hover:scale-[1.02]" />
    </a>
  )
  const copy = (
    <>
      <p className={`text-[10px] font-bold uppercase tracking-[0.3em] sm:text-xs ${theme.eyebrow}`}>{eyebrow}</p>
      <h2 className={`mt-3 font-display text-4xl font-normal leading-tight sm:text-5xl ${theme.title}`}>{collection.title}</h2>
      {collection.description && <p className={`mt-4 max-w-md text-sm leading-relaxed sm:text-base ${theme.body}`}>{collection.description}</p>}
      <CollectionAction products={collection.products} selected={selected} onSelect={setSelectedId} ctaLabel={collection.ctaLabel} theme={theme} centred={index === 2} />
    </>
  )

  if (index === 2) {
    return (
      <section className={`${theme.section} px-5 py-20 text-center sm:px-8 sm:py-28`}>
        <div className="mx-auto max-w-4xl">
          <p className={`text-[10px] font-bold uppercase tracking-[0.3em] sm:text-xs ${theme.eyebrow}`}>{eyebrow}</p>
          <h2 className={`mt-3 font-display text-4xl font-normal sm:text-6xl ${theme.title}`}>{collection.title}</h2>
          <div className="mt-10 sm:mt-14">{photo}</div>
          {collection.description && <p className={`mx-auto mt-10 max-w-xl text-sm leading-relaxed sm:text-lg ${theme.body}`}>{collection.description}</p>}
          <div className="flex justify-center"><CollectionAction products={collection.products} selected={selected} onSelect={setSelectedId} ctaLabel={collection.ctaLabel} theme={theme} centred={index === 2} /></div>
        </div>
      </section>
    )
  }

  return (
    <section className={`${theme.section} px-5 py-16 sm:px-8 sm:py-24`}>
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div className={index === 1 ? 'lg:order-2' : ''}>{photo}</div>
        <div className={index === 1 ? 'lg:order-1' : ''}>{copy}</div>
      </div>
    </section>
  )
}

/** Gift choice (when the collection offers several) + Add to cart for the chosen gift. */
function CollectionAction({ products, selected, onSelect, ctaLabel, theme, centred }: {
  products: ProductSummary[]
  selected: ProductSummary | null
  onSelect: (id: string) => void
  ctaLabel: string
  theme: (typeof THEMES)[number]
  centred: boolean
}) {
  const { quickAdd, isAdding } = useQuickAdd()
  // No gift linked (or all hidden in the store): the collection is shown without a button.
  if (!selected) return null
  const busy = isAdding(selected.id)
  return (
    <div className={`mt-8 grid gap-5 ${centred ? 'justify-items-center' : ''}`}>
      {products.length > 1 && (
        <div role="radiogroup" aria-label="Choose your gift" className={`flex flex-wrap gap-2 ${centred ? 'justify-center' : ''}`}>
          {products.map((product) => {
            const on = product.id === selected.id
            return (
              <button
                key={product.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => onSelect(product.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${on ? theme.pillOn : theme.pill}`}
              >
                {on && <Check size={13} aria-hidden />}
                {product.name}
                <span className="opacity-75">· {formatMoney(product.price)}</span>
              </button>
            )
          })}
        </div>
      )}
      <div className={`flex flex-wrap items-center gap-x-5 gap-y-3 ${centred ? 'justify-center' : ''}`}>
        <button
          type="button"
          onClick={() => void quickAdd(selected)}
          disabled={busy || !selected.inStock}
          className={`inline-flex h-12 min-w-44 items-center justify-center gap-2 px-8 text-[11px] font-bold uppercase tracking-[0.22em] transition disabled:cursor-not-allowed disabled:opacity-60 ${theme.button}`}
        >
          {busy ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <ShoppingBag size={15} aria-hidden />}
          {selected.inStock ? ctaLabel : 'Sold out'}
        </button>
        <span className={`text-sm ${theme.price}`}>
          {products.length > 1 && <span className="mr-2 opacity-75">{selected.name}</span>}
          <span className="font-semibold">{formatMoney(selected.price)}</span>
          {selected.compareAtPrice !== null && selected.compareAtPrice > selected.price && (
            <s className="ml-2 opacity-60">{formatMoney(selected.compareAtPrice)}</s>
          )}
        </span>
      </div>
    </div>
  )
}

// ── Celebrated Across Moments ────────────────────────────

function Moments({ moments }: { moments: GiftDesignView['moments'] }) {
  const items = moments.items.map((item, index) => ({ ...item, image: item.imageUrl ?? MOMENT_FALLBACKS[index] ?? moment1 }))
  const card = (item: (typeof items)[number], className: string) => (
    <figure key={item.title} className={`group relative isolate overflow-hidden ${className}`}>
      <img src={item.image} alt="" loading="lazy" className="absolute inset-0 -z-20 size-full object-cover transition duration-700 group-hover:scale-105" />
      <span className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/15 to-black/5" aria-hidden />
      <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
        <span className="block font-display text-2xl text-white sm:text-3xl">{item.title}</span>
        {item.tagline && <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#d9b27c]">{item.tagline}</span>}
      </figcaption>
    </figure>
  )
  return (
    <section className="px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-sm font-display text-4xl font-medium leading-[1.05] text-stone-900 sm:text-6xl dark:text-stone-50">{moments.title}</h2>
          {moments.subtitle && <p className="max-w-xs text-sm leading-relaxed text-stone-500 dark:text-stone-400">{moments.subtitle}</p>}
        </div>
        {/* Phones: two columns. Desktop: two tall cards, then two stacked — as in the design. */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:h-[640px] lg:grid-cols-[1.35fr_1fr_1.7fr] lg:grid-rows-2">
          {items[0] && card(items[0], 'aspect-[3/4] lg:row-span-2 lg:aspect-auto')}
          {items[1] && card(items[1], 'aspect-[3/4] lg:row-span-2 lg:aspect-auto')}
          {items[2] && card(items[2], 'aspect-[4/3] lg:aspect-auto')}
          {items[3] && card(items[3], 'aspect-[4/3] lg:col-start-3 lg:aspect-auto')}
        </div>
      </div>
    </section>
  )
}

// ── Pillars, journey, quote ──────────────────────────────

function Pillars({ pillars }: { pillars: GiftDesignView['pillars'] }) {
  return (
    <section className="bg-[#1c4532] px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl border-t border-white/15 pt-14">
        <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.items.map((item, index) => (
            <li key={`${item.title}-${index}`}>
              <span className="font-display text-3xl italic text-[#c9a46a]">{String(index + 1).padStart(2, '0')}.</span>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-white">{item.title}</p>
              {item.body && <p className="mt-3 text-sm leading-relaxed text-white/60">{item.body}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Journey({ journey }: { journey: GiftDesignView['journey'] }) {
  return (
    <section className="bg-[#efede8] px-5 py-20 sm:px-8 sm:py-24 dark:bg-stone-900">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-display text-4xl font-medium text-stone-900 sm:text-5xl dark:text-stone-50">{journey.title}</h2>
        <ol className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <span className="absolute inset-x-0 top-8 hidden h-px bg-[#e5dccb] lg:block" aria-hidden />
          {journey.steps.map((step, index) => (
            <li key={`${step.title}-${index}`} className="relative text-center">
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#d9b07a] font-display text-2xl text-white ring-4 ring-white dark:ring-stone-900">{index + 1}</span>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#c9965a]">{step.title}</p>
              {step.body && <p className="mx-auto mt-3 max-w-[16rem] text-sm leading-relaxed text-stone-500 dark:text-stone-400">{step.body}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/** "Get a quote" opens WhatsApp with the hero's number — there are no forms on this page. */
function QuoteBanner({ cta, hero }: { cta: GiftDesignView['cta']; hero: GiftDesignView['hero'] }) {
  const message = encodeURIComponent(`${hero.whatsappMessage || 'Hi Bossco!'} I would like a quote for gift orders.`)
  return (
    <section className="relative isolate overflow-hidden px-5 py-24 text-center sm:py-32">
      <img src={cta.imageUrl ?? ctaFallback} alt="" loading="lazy" className="absolute inset-0 -z-20 size-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-black/60" aria-hidden />
      <h2 className="mx-auto max-w-4xl font-display text-4xl font-medium text-white sm:text-6xl">{cta.title}</h2>
      <a
        href={`https://wa.me/${hero.whatsappNumber}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-10 inline-flex h-14 min-w-56 items-center justify-center gap-2 bg-[#c9a46a] px-10 text-xs font-bold uppercase tracking-[0.3em] text-white transition hover:bg-[#b8914f]"
      >
        <MessageCircle size={16} aria-hidden /> {cta.buttonLabel}
      </a>
    </section>
  )
}
