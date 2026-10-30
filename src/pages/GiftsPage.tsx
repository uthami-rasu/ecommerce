import { useState, type FormEvent } from 'react'
import {
  ArrowRight,
  Check,
  ChevronDown,
  Gift,
  Loader2,
  MessageCircle,
  RotateCcw,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { Footer } from '../components/layout/Footer'
import { useQuickAdd } from '../components/catalog/useQuickAdd'
import { GiftEnquiryDialog } from '../components/gifts/GiftEnquiryDialog'
import { GiftProductCard, GiftProductCardSkeleton } from '../components/gifts/GiftProductCard'
import { useGetProductsQuery } from '../features/catalog/catalogApi'
import { useCreateGiftEnquiryMutation, useGetGiftPageQuery } from '../features/gifting/giftingApi'
import { useRoute } from '../hooks/useRoute'
import { useWishlist } from '../hooks/useWishlist'
import { errorMessage } from '../lib/http/apiClient'
import type {
  GiftBudgetTier,
  GiftEnquiryKind,
  GiftOccasion,
  GiftPageContent,
  ProductQuery,
  ProductSort,
  ProductSummary,
} from '../types/api'
import { navigate } from '../utils/router'

// Exact optimized user design assets
import heroSovereign from '../assets/images/gifts/hero-sovereign.webp'
import artOfGiftingTeal from '../assets/images/gifts/art-of-gifting-teal.webp'
import ivorySignature from '../assets/images/gifts/ivory-signature.webp'
import royalCrimson from '../assets/images/gifts/royal-crimson.webp'
import onyxSelectionWide from '../assets/images/gifts/onyx-selection-wide.webp'
import momentWeddings from '../assets/images/gifts/moment-weddings.webp'
import momentCorporate from '../assets/images/gifts/moment-corporate.webp'
import momentCorporateDinner from '../assets/images/gifts/moment-corporate-dinner.webp'
import momentFestive from '../assets/images/gifts/moment-festive.webp'
import momentEngagement from '../assets/images/gifts/moment-engagement.webp'
import visionStackedQuote from '../assets/images/gifts/vision-stacked-quote.webp'
import bannerLegacy from '../assets/images/gifts/banner-legacy.webp'

const PAGE_SIZE = 8

const SORTS: Array<{ value: ProductSort; label: string }> = [
  { value: 'featured', label: 'Curated' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
]

const tierQuery = (tier: GiftBudgetTier | undefined): Pick<ProductQuery, 'minPrice' | 'maxPrice'> =>
  tier ? { minPrice: tier.minPrice ?? undefined, maxPrice: tier.maxPrice ?? undefined } : {}

const scrollToListing = () =>
  document.getElementById('gift-catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

export function GiftsPage() {
  const route = useRoute()
  const { data, isLoading, error, refetch } = useGetGiftPageQuery()
  const [enquiry, setEnquiry] = useState<GiftEnquiryKind | null>(null)

  const occasionSlug = route.query.get('occasion') ?? undefined
  const budgetIndex = route.query.get('budget')
  const sort = (SORTS.find((item) => item.value === route.query.get('sort'))?.value ?? 'featured') as ProductSort

  const setFilters = (next: { occasion?: string | null; budget?: number | null; sort?: ProductSort }, scroll = false) => {
    const current = {
      occasion: occasionSlug,
      budget: budgetIndex ?? undefined,
      sort: sort === 'featured' ? undefined : sort,
    }
    navigate('gifts', {
      replace: true,
      query: {
        occasion: next.occasion === undefined ? current.occasion : next.occasion ?? undefined,
        budget: next.budget === undefined ? current.budget : next.budget === null ? undefined : String(next.budget),
        sort: next.sort === undefined ? current.sort : next.sort === 'featured' ? undefined : next.sort,
      },
    })
    if (scroll) setTimeout(scrollToListing, 40)
  }

  if (isLoading) return <GiftsPageSkeleton />
  if (!data) {
    return (
      <main className="grid min-h-[60vh] place-items-center px-6 text-center bg-[#FAF7F2]">
        <div role="alert" className="max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <Gift className="mx-auto text-[#c59a58]" size={40} />
          <h1 className="mt-4 font-display text-3xl font-semibold text-stone-900">We couldn’t load the gift collection</h1>
          <p className="mt-2 text-sm text-stone-500">{errorMessage(error)}</p>
          <button
            type="button"
            onClick={refetch}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-stone-800"
          >
            <RotateCcw size={14} /> Try again
          </button>
        </div>
      </main>
    )
  }

  const { content, occasions } = data
  const occasion = occasions.find((item) => item.slug === occasionSlug)
  const tiers = content.budget.enabled ? content.budget.tiers : []
  const tier = budgetIndex !== null ? tiers[Number(budgetIndex)] : undefined

  return (
    <main className="bg-[#FAF7F2] text-stone-800 antialiased selection:bg-[#a07840]/20 selection:text-stone-900">
      {/* 1. Hero Section */}
      <HeroSection hero={content.hero} onExplore={scrollToListing} />

      {/* 2. The Art of Thoughtful Gifting */}
      <ArtOfGiftingSection />

      {/* 3. The Ivory Collection */}
      <IvoryCollectionSection onDiscover={() => setFilters({ occasion: null }, true)} />

      {/* 4. The Royal Crimson */}
      <RoyalCrimsonSection onExplore={() => setFilters({ occasion: 'weddings' }, true)} />

      {/* 5. The Onyx Selection */}
      <OnyxSelectionSection onExplore={() => setFilters({ occasion: 'corporate-events' }, true)} />

      {/* 6. Celebrate Special Moments */}
      <CelebrateMomentsSection onSelect={(slug) => setFilters({ occasion: slug }, true)} />

      {/* 7. Brand Value Pillars */}
      <BrandPillarsSection />

      {/* 8. The Journey of Every Gift */}
      <JourneyTimelineSection />

      {/* 9. Your Vision - Bespoke Inquiry */}
      <YourVisionSection occasions={occasions} />

      {/* 10. Curated Catalog / Product Listing */}
      <section id="gift-catalog" className="scroll-mt-24 border-t border-stone-200/80 bg-[#F7F4EE] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#a07840]">Bespoke Offerings</span>
            <h2 className="mt-2 font-display text-3xl font-normal tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
              Curated Gift Collections
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-stone-600">
              Each hamper is hand-assembled with hand-selected gourmet nuts, wholesome dried fruits, and artisanal keepsakes.
            </p>
          </div>

          <div className="mt-10">
            <OccasionTabs occasions={occasions} active={occasion?.slug} onSelect={(slug) => setFilters({ occasion: slug })} />
          </div>

          <GiftListing
            key={`${occasion?.slug}:${budgetIndex}:${sort}`}
            query={{ gift: true, occasion: occasion?.slug, sort, ...tierQuery(tier) }}
            sort={sort}
            tier={tier}
            occasion={occasion}
            tiers={tiers}
            activeBudgetIndex={tier ? Number(budgetIndex) : null}
            onSelectBudget={(idx) => setFilters({ budget: idx })}
            onSort={(value) => setFilters({ sort: value })}
            onClearBudget={() => setFilters({ budget: null })}
            onClearAll={() => setFilters({ occasion: null, budget: null })}
          />
        </div>
      </section>

      {/* 11. Frequently Asked Questions */}
      <FaqSection />

      {/* 12. Closing Banner */}
      <ClosingCtaBanner onQuote={() => setEnquiry('bulk')} />

      {/* Existing enquiry dialog support */}
      <GiftEnquiryDialog kind={enquiry} occasions={occasions} occasion={occasion?.name} onClose={() => setEnquiry(null)} />

      <Footer />
    </main>
  )
}

// ── 1. Hero Section ─────────────────────────────────────────

function HeroSection({
  hero,
  onExplore,
}: {
  hero: GiftPageContent['hero']
  onExplore: () => void
}) {
  const whatsapp = `https://wa.me/${hero.whatsappNumber}${hero.whatsappMessage ? `?text=${encodeURIComponent(hero.whatsappMessage)}` : ''}`

  return (
    <section className="relative overflow-hidden bg-[#FAF7F2] pb-16 pt-12 sm:pb-24 sm:pt-20 lg:pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Text */}
          <div className="lg:col-span-5 lg:pr-4">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a07840]">
              {hero.eyebrow || 'Bespoke Curations'}
            </span>

            <h1 className="mt-4 font-display text-4xl font-normal leading-[1.08] tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
              Make Every
              <br />
              Occasion
              <br />
              <span className="italic font-normal">Extraordinary.</span>
            </h1>

            <p className="mt-5 max-w-md text-sm leading-relaxed text-stone-600 sm:text-base">
              {hero.subtitle ||
                'An exclusive selection of dry fruits and nuts, elegantly hand-packed to elevate every moment of celebration and gratitude.'}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onExplore}
                className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-7 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-md transition duration-200 hover:bg-[#a07840]"
              >
                Explore Gifts <ArrowRight size={14} />
              </button>

              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/80 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-stone-800 transition duration-200 hover:border-stone-900 hover:bg-white"
              >
                <MessageCircle size={14} className="text-[#25D366]" /> Inquire
              </a>
            </div>
          </div>

          {/* Right Hero Image (The Sovereign with Pedestals) */}
          <div className="relative lg:col-span-7">
            <div className="relative mx-auto overflow-hidden rounded-2xl shadow-2xl ring-1 ring-stone-900/5">
              <img
                src={heroSovereign}
                alt="The Sovereign - New Arrival Festive 24 Gift Box Collection on antique stone pedestals"
                fetchPriority="high"
                className="w-full h-auto object-cover transition duration-700 hover:scale-[1.01]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── 2. The Art of Thoughtful Gifting ────────────────────────

function ArtOfGiftingSection() {
  const pillars = [
    {
      num: '01',
      title: 'Artisanal Selection',
      desc: 'Hand-selected premium dry fruits and rare nuts sourced from premier orchards around the world.',
    },
    {
      num: '02',
      title: 'Bespoke Craftsmanship',
      desc: 'Each box is thoughtfully constructed with archival-grade papers, silk ribbons, and custom wax finishes.',
    },
    {
      num: '03',
      title: 'Delivered with Distinction',
      desc: 'Seamless nationwide and white-glove gifting delivery ensuring pristine presentation on arrival.',
    },
  ]

  return (
    <section className="bg-[#FAF7F2] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left: Teal & Gold Gift Box */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-stone-900/5">
              <img
                src={artOfGiftingTeal}
                alt="Artisanal gift box wrapped in textured teal paper with gold ribbon"
                loading="lazy"
                className="w-full aspect-square object-cover transition duration-700 hover:scale-[1.02]"
              />
            </div>
          </div>

          {/* Right: Copy & 01, 02, 03 */}
          <div className="lg:col-span-7">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#a07840]">Philosophy</span>
            <h2 className="mt-3 font-display text-3xl font-normal tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
              The Art of
              <br />
              Thoughtful Gifting
            </h2>

            <div className="mt-10 space-y-8">
              {pillars.map((item) => (
                <div key={item.num} className="flex items-start gap-6 border-b border-stone-200/60 pb-7 last:border-b-0 last:pb-0">
                  <span className="font-display text-2xl font-normal text-[#a07840] sm:text-3xl">{item.num}</span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-stone-900 sm:text-xl">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-stone-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── 3. The Ivory Collection ─────────────────────────────────

function IvoryCollectionSection({ onDiscover }: { onDiscover: () => void }) {
  return (
    <section className="bg-[#EBE4D8] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left: Stack of Ivory Boxes */}
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-2xl bg-stone-100/50 shadow-xl">
              <img
                src={ivorySignature}
                alt="Signature Collection ivory gift boxes filled with roasted nuts and macadamias"
                loading="lazy"
                className="w-full aspect-[1012/667] object-cover transition duration-700 hover:scale-[1.02]"
              />
            </div>
          </div>

          {/* Right: Text */}
          <div className="lg:col-span-6">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8c6b3e]">Timeless Purity</span>
            <h2 className="mt-3 font-display text-3xl font-normal tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
              The Ivory Collection
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-stone-700 sm:text-base">
              Understated elegance featuring natural linen textures and gentle kraft tones, filled with our finest harvest of slow-roasted
              nuts, roasted cashews, and macadamias. Handcrafted for minimalists who appreciate subtle luxury.
            </p>
            <div className="mt-8">
              <button
                type="button"
                onClick={onDiscover}
                className="inline-flex items-center gap-2 rounded-full border border-stone-800 bg-transparent px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] text-stone-900 transition hover:bg-stone-900 hover:text-white"
              >
                Discover Now <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── 4. The Royal Crimson ────────────────────────────────────

function RoyalCrimsonSection({ onExplore }: { onExplore: () => void }) {
  return (
    <section className="bg-[#521323] py-20 text-[#FAF7F2] sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left: Text */}
          <div className="order-2 lg:order-1 lg:col-span-6">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#e5c478]">Heritage & Tradition</span>
            <h2 className="mt-3 font-display text-3xl font-normal tracking-tight text-white sm:text-4xl lg:text-5xl">
              The Royal Crimson
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-stone-200/90 sm:text-base">
              Opulent packaging cloaked in rich royal crimson velvet with gold-foil accents and hand-tied ribbons. Created to honor life’s
              grandest celebrations, weddings, and festive milestones with unmatched warmth and grandeur.
            </p>
            <div className="mt-8">
              <button
                type="button"
                onClick={onExplore}
                className="inline-flex items-center gap-2 rounded-full border border-[#e5c478] bg-transparent px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#e5c478] transition hover:bg-[#e5c478] hover:text-[#3d0b17]"
              >
                View Selection <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Right: Crimson Box Image */}
          <div className="order-1 lg:order-2 lg:col-span-6">
            <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
              <img
                src={royalCrimson}
                alt="Royal crimson gift boxes with spiced nuts and dried fruits"
                loading="lazy"
                className="w-full aspect-[1012/667] object-cover transition duration-700 hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── 5. The Onyx Selection ───────────────────────────────────

function OnyxSelectionSection({ onExplore }: { onExplore: () => void }) {
  return (
    <section className="bg-[#0E0E10] py-24 text-stone-100 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c9a96e]">Modern Opulence</span>
        <h2 className="mt-3 font-display text-3xl font-normal tracking-tight text-white sm:text-4xl lg:text-5xl">
          The Onyx Selection
        </h2>

        {/* Centerpiece Image */}
        <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
          <img
            src={onyxSelectionWide}
            alt="Matte black luxury gift hampers with gold satin bow and gourmet canisters on black slate"
            loading="lazy"
            className="w-full aspect-[1792/800] object-cover transition duration-700 hover:scale-[1.01]"
          />
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-stone-400 sm:text-base">
          A dramatic expression of contemporary sophistication. Bold, matte-black presentation boxes paired with decadent gourmet
          selections, roasted almonds, and rare dried berries for executive gifting.
        </p>

        <div className="mt-8">
          <button
            type="button"
            onClick={onExplore}
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-stone-900 shadow-lg transition hover:bg-[#c9a96e] hover:text-stone-950"
          >
            Explore Onyx <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  )
}

// ── 6. Celebrated Across Moments ────────────────────────────

function CelebrateMomentsSection({
  onSelect,
}: {
  onSelect: (slug: string) => void
}) {
  return (
    <section className="bg-[#FAF7F2] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="grid items-end gap-6 sm:grid-cols-12">
          <div className="sm:col-span-7">
            <h2 className="font-display text-4xl sm:text-5xl font-normal leading-[1.08] tracking-tight text-stone-900">
              Celebrated
              <br />
              Across Moments
            </h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-stone-500 sm:col-span-5 sm:text-right max-w-sm sm:justify-self-end">
            From intimate unions to grand corporate milestones, we provide the perfect companion for your memories.
          </p>
        </div>

        {/* 3-Column Mood Grid matching Figma */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12">
          {/* Column 1: Chandelier (Weddings) */}
          <div className="lg:col-span-4">
            <button
              type="button"
              onClick={() => onSelect('weddings')}
              className="group relative isolate block h-full w-full min-h-[460px] sm:min-h-[540px] lg:min-h-[620px] overflow-hidden rounded-2xl text-left shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a07840]"
            >
              <img
                src={momentWeddings}
                alt="Weddings - Elegance Redefined"
                loading="lazy"
                className="size-full object-cover transition duration-700 group-hover:scale-105"
              />
            </button>
          </div>

          {/* Column 2: Corporate Dining Table under Spotlight */}
          <div className="lg:col-span-4">
            <button
              type="button"
              onClick={() => onSelect('corporate-events')}
              className="group relative isolate block h-full w-full min-h-[460px] sm:min-h-[540px] lg:min-h-[620px] overflow-hidden rounded-2xl text-left shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a07840]"
            >
              <img
                src={momentCorporateDinner}
                alt="Corporate - Legacy Building"
                loading="lazy"
                className="size-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/85 via-black/35 to-transparent">
                <p className="font-display text-2xl font-normal text-white">Corporate</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#e5c478]">Legacy Building</p>
              </div>
            </button>
          </div>

          {/* Column 3: Stacked Festive & Engagement */}
          <div className="flex flex-col gap-6 sm:col-span-2 lg:col-span-4">
            <button
              type="button"
              onClick={() => onSelect('house-warming')}
              className="group relative isolate block flex-1 min-h-[220px] sm:min-h-[260px] lg:min-h-[298px] overflow-hidden rounded-2xl text-left shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a07840]"
            >
              <img
                src={momentFestive}
                alt="Festive - Cultural Grace"
                loading="lazy"
                className="size-full object-cover transition duration-700 group-hover:scale-105"
              />
            </button>

            <button
              type="button"
              onClick={() => onSelect('baby-shower')}
              className="group relative isolate block flex-1 min-h-[220px] sm:min-h-[260px] lg:min-h-[298px] overflow-hidden rounded-2xl text-left shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a07840]"
            >
              <img
                src={momentEngagement}
                alt="Engagement - New Beginnings"
                loading="lazy"
                className="size-full object-cover transition duration-700 group-hover:scale-105"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── 7. Brand Value Pillars (Dark Strip) ──────────────────────

function BrandPillarsSection() {
  const pillars = [
    {
      num: '01.',
      title: 'UNRIVALLED SOURCING',
      desc: "Direct partnerships with the world's most exclusive estates for the largest grade cashews and finest saffron.",
    },
    {
      num: '02.',
      title: 'ARTISANAL DESIGN',
      desc: 'Each gift box is a work of art, featuring hand-pressed foils and custom-textured papers designed in-house.',
    },
    {
      num: '03.',
      title: 'PRECISION LOGISTICS',
      desc: 'White-glove delivery service ensuring your bulk orders arrive with the same care they were packed with.',
    },
    {
      num: '04.',
      title: 'GLOBAL REACH',
      desc: 'Shipping to over 45 countries with full customs management and temperature-controlled transit.',
    },
  ]

  return (
    <section className="bg-[#111113] py-16 sm:py-20 text-stone-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {pillars.map((item) => (
            <div key={item.num} className="border-t border-stone-800/90 pt-5">
              <span className="font-display text-sm tracking-wider text-[#d4af37]">{item.num}</span>
              <h3 className="mt-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white">{item.title}</h3>
              <p className="mt-2.5 text-xs leading-relaxed text-stone-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── 8. The Journey of Every Gift ────────────────────────────

function JourneyTimelineSection() {
  const steps = [
    {
      num: '01',
      step: 'Curation',
      desc: 'Choose your box silhouette, velvet lining, and gourmet nut assortments.',
    },
    {
      num: '02',
      step: 'Personalization',
      desc: 'Add custom laser-engraved names, wax monogram seals, and gift message cards.',
    },
    {
      num: '03',
      step: 'Artisanal Packing',
      desc: 'Carefully sealed in vacuum chambers to lock in natural aroma and golden crunch.',
    },
    {
      num: '04',
      step: 'White-Glove Dispatch',
      desc: 'Dispatched with multi-tier protective cushioning and door-to-door live tracking.',
    },
  ]

  return (
    <section className="bg-[#F3ECE1] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8c6b3e]">The Process</span>
        <h2 className="mt-2 font-display text-3xl font-normal tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
          The Journey of Every Gift
        </h2>

        {/* Timeline Desktop & Mobile */}
        <div className="relative mt-16">
          {/* Horizontal Line on Desktop */}
          <div className="hidden lg:block absolute left-12 right-12 top-6 h-[1.5px] bg-stone-300 -z-0" aria-hidden />

          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {steps.map((item) => (
              <div key={item.num} className="relative z-10 flex flex-col items-center">
                <div className="grid size-12 place-items-center rounded-full bg-stone-900 text-white shadow-md">
                  <span className="font-display text-sm font-bold text-[#e5c478]">{item.num}</span>
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-stone-900">{item.step}</h3>
                <p className="mt-2 max-w-xs text-center text-xs leading-relaxed text-stone-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── 9. Your Vision - Bespoke Inquiry Form ───────────────────

function YourVisionSection({ occasions }: { occasions: GiftOccasion[] }) {
  const [createEnquiry, { isLoading, isSuccess }] = useCreateGiftEnquiryMutation()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [occasion, setOccasion] = useState(occasions[0]?.name ?? 'Weddings')
  const [quantity, setQuantity] = useState('50')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name || !phone || !email) return
    try {
      await createEnquiry({
        kind: 'bulk',
        fullName: name,
        phone,
        email,
        occasion,
        quantity: Number(quantity) || undefined,
        message: message || `Bespoke inquiry for ${occasion} with ~${quantity} units`,
      }).unwrap()
    } catch {
      // Error handled by redux
    }
  }

  return (
    <section className="bg-[#FAF7F2] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left: Stacked Gift Box with Quote */}
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-stone-900/5">
              <img
                src={visionStackedQuote}
                alt="Every gift tells a story. What will yours say?"
                loading="lazy"
                className="w-full aspect-[832/1067] object-cover"
              />
            </div>
          </div>

          {/* Right: Modern Luxury Inquiry Form */}
          <div className="lg:col-span-7">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#a07840]">Bespoke Concierge</span>
            <h2 className="mt-2 font-display text-3xl font-normal tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
              Your Vision
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Planning wedding return favors, anniversary hampers, or executive gifts? Tell us your requirements, and our gifting
              curator will craft a bespoke presentation proposal within 24 hours.
            </p>

            {isSuccess ? (
              <div className="mt-8 rounded-2xl border border-[#c9a96e]/30 bg-[#FAF3E6] p-8 text-center">
                <Check className="mx-auto size-10 text-[#a07840]" />
                <h3 className="mt-3 font-display text-2xl font-semibold text-stone-900">Inquiry Received with Distinction</h3>
                <p className="mt-2 text-sm text-stone-600">
                  Thank you, {name}. Our bespoke gifting concierge will review your vision and connect with you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ananya Roy"
                      className="mt-1.5 w-full border-b border-stone-300 bg-transparent py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="mt-1.5 w-full border-b border-stone-300 bg-transparent py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ananya@example.com"
                      className="mt-1.5 w-full border-b border-stone-300 bg-transparent py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600">Occasion</label>
                    <select
                      value={occasion}
                      onChange={(e) => setOccasion(e.target.value)}
                      className="mt-1.5 w-full border-b border-stone-300 bg-transparent py-2 text-sm text-stone-900 focus:border-stone-900 focus:outline-none"
                    >
                      {occasions.map((item) => (
                        <option key={item.id} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                      <option value="Other">Other Bespoke Event</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600">
                    Estimated Quantity & Specific Preferences
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about the guest count, packaging color theme, or budget range..."
                    className="mt-1.5 w-full border-b border-stone-300 bg-transparent py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none"
                  />
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#a07840] disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Submit Inquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── 10. Filter Tabs & Product Catalog ───────────────────────

function OccasionTabs({
  occasions,
  active,
  onSelect,
}: {
  occasions: GiftOccasion[]
  active?: string
  onSelect: (slug: string | null) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition ${
          !active
            ? 'bg-stone-900 text-white shadow-sm'
            : 'border border-stone-300 bg-white/70 text-stone-700 hover:border-stone-900 hover:bg-white'
        }`}
      >
        All Collections
      </button>

      {occasions.map((item) => {
        const selected = active === item.slug
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.slug)}
            className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition ${
              selected
                ? 'bg-stone-900 text-white shadow-sm'
                : 'border border-stone-300 bg-white/70 text-stone-700 hover:border-stone-900 hover:bg-white'
            }`}
          >
            {item.name}
          </button>
        )
      })}
    </div>
  )
}

type GiftListingProps = {
  query: ProductQuery
  sort: ProductSort
  tier?: GiftBudgetTier
  occasion?: GiftOccasion
  tiers: GiftBudgetTier[]
  activeBudgetIndex: number | null
  onSelectBudget: (index: number | null) => void
  onSort: (sort: ProductSort) => void
  onClearBudget: () => void
  onClearAll: () => void
}

function GiftListing({
  query,
  sort,
  tier,
  occasion,
  tiers,
  activeBudgetIndex,
  onSelectBudget,
  onSort,
  onClearBudget,
  onClearAll,
}: GiftListingProps) {
  const [pages, setPages] = useState(1)
  const key = JSON.stringify(query)

  const first = useGetProductsQuery({ ...query, page: 1, limit: PAGE_SIZE })
  const total = first.data?.meta.total ?? 0

  return (
    <div className="mt-12">
      {/* Secondary Controls Bar: Budget Pills & Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/80 pb-6">
        {/* Budget Tiers */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Budget:</span>
          {tiers.map((t, idx) => (
            <button
              key={t.title}
              type="button"
              onClick={() => onSelectBudget(activeBudgetIndex === idx ? null : idx)}
              className={`rounded-full px-3.5 py-1 text-xs font-medium transition ${
                activeBudgetIndex === idx
                  ? 'bg-[#a07840] text-white shadow-sm'
                  : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:ring-stone-400'
              }`}
            >
              {t.title}
            </button>
          ))}
          {tier && (
            <button
              type="button"
              onClick={onClearBudget}
              className="inline-flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-900"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* Sort & Count */}
        <div className="flex items-center gap-4">
          <p className="hidden text-xs text-stone-500 sm:block">
            {first.isFetching && !first.data
              ? 'Loading…'
              : `${total} ${total === 1 ? 'Hamper' : 'Hampers'}${occasion ? ` for ${occasion.name}` : ''}`}
          </p>

          <label className="flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs text-stone-600 ring-1 ring-stone-200">
            <span>Sort:</span>
            <select
              value={sort}
              onChange={(e) => onSort(e.target.value as ProductSort)}
              className="bg-transparent text-xs font-semibold text-stone-900 focus:outline-none"
            >
              {SORTS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Grid or Empty/Error */}
      {first.error ? (
        <div role="alert" className="mt-12 rounded-2xl bg-white p-8 text-center ring-1 ring-stone-200">
          <p className="text-sm text-stone-600">{errorMessage(first.error)}</p>
          <button
            type="button"
            onClick={first.refetch}
            className="mt-4 rounded-full bg-stone-900 px-6 py-2 text-xs font-bold uppercase tracking-wider text-white"
          >
            Try again
          </button>
        </div>
      ) : first.data && total === 0 ? (
        <div className="mt-12 rounded-2xl bg-white p-12 text-center ring-1 ring-stone-200">
          <Gift className="mx-auto text-[#a07840]" size={36} aria-hidden />
          <h3 className="mt-4 font-display text-2xl font-semibold text-stone-900">No gift boxes match this filter</h3>
          <p className="mt-2 text-sm text-stone-500">Try selecting a different occasion or clearing your budget filters.</p>
          <button
            type="button"
            onClick={onClearAll}
            className="mt-6 rounded-full border border-stone-800 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-900 transition hover:bg-stone-900 hover:text-white"
          >
            Show All Hampers
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: pages }, (_, index) => (
            <GiftProductPage key={`${key}:${index}`} query={query} page={index + 1} />
          ))}
        </div>
      )}

      {/* Load More */}
      {pages * PAGE_SIZE < total && (
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => setPages((current) => current + 1)}
            className="rounded-full border border-stone-800 bg-white px-9 py-3 text-xs font-bold uppercase tracking-[0.18em] text-stone-900 shadow-sm transition hover:bg-stone-900 hover:text-white"
          >
            Load More Gifts
          </button>
        </div>
      )}
    </div>
  )
}

function GiftProductPage({ query, page }: { query: ProductQuery; page: number }) {
  const { data, isLoading } = useGetProductsQuery({ ...query, page, limit: PAGE_SIZE })
  const { quickAdd, isAdding } = useQuickAdd()
  const { isWished, toggle } = useWishlist()

  if (isLoading || !data) {
    return (
      <>
        {Array.from({ length: 4 }, (_, index) => (
          <GiftProductCardSkeleton key={index} />
        ))}
      </>
    )
  }

  const buyNow = async (product: ProductSummary) => {
    if (await quickAdd(product, 1, { silent: true })) navigate('checkout')
  }

  return (
    <>
      {data.data.map((product) => (
        <GiftProductCard
          key={product.id}
          product={product}
          wished={isWished(product.id)}
          busy={isAdding(product.id)}
          onWish={() => toggle(product)}
          onAdd={() => quickAdd(product)}
          onBuy={() => void buyNow(product)}
        />
      ))}
    </>
  )
}

// ── 11. Frequently Asked Questions (Accordion) ──────────────

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: 'Can I customize the contents of the gift boxes?',
      a: 'Yes, absolutely. You can curate any combination of our slow-roasted nuts, exotic dried berries, Kashmiri saffron, and organic honey jars, as well as select custom box ribbons, sleeve graphics, and personalized gift notes.',
    },
    {
      q: 'What is the minimum order quantity (MOQ) for corporate or wedding gifts?',
      a: 'For our catalog hampers, there is no minimum order quantity. For bespoke customizations (such as custom logo hot-stamping, engraved wooden lids, or custom Pantone dyed boxes), our MOQ starts at just 25 boxes.',
    },
    {
      q: 'How long do the dry fruits and nuts stay fresh?',
      a: 'All our gourmet dry fruits and nuts are nitrogen-sealed in airtight pouches to preserve peak crunch, natural aroma, and nutritional vitality for up to 6 months without synthetic preservatives.',
    },
    {
      q: 'Do you offer pan-India and individual multi-address dispatch?',
      a: 'Yes, we provide secure door-to-door delivery across 18,000+ pin codes across India. For corporate teams and wedding registries, you can provide an address sheet, and our concierge team coordinates direct delivery to each recipient.',
    },
    {
      q: 'Can you include personalized message cards or custom branding?',
      a: 'Yes. Every hamper can be accompanied by metallic gold-foil stamped greeting cards with your personalized message, company logo, or wedding monogram.',
    },
  ]

  const toggle = (idx: number) => {
    setOpenIndex((curr) => (curr === idx ? null : idx))
  }

  return (
    <section className="bg-[#FAF7F2] py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#a07840]">Assurance</span>
          <h2 className="mt-2 font-display text-3xl font-normal tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-12 divide-y divide-stone-200">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div key={idx} className="py-5">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between text-left focus:outline-none"
                >
                  <span className="font-display text-lg font-normal text-stone-900 sm:text-xl">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`ml-4 shrink-0 text-stone-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-stone-900' : ''}`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-3 pr-8 text-sm leading-relaxed text-stone-600 transition-all duration-200">{faq.a}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── 12. Closing Banner ──────────────────────────────────────

function ClosingCtaBanner({ onQuote }: { onQuote: () => void }) {
  return (
    <section className="relative isolate overflow-hidden bg-stone-950">
      <img
        src={bannerLegacy}
        alt="Define Your Legacy Through Gifting."
        loading="lazy"
        className="w-full aspect-[1920/667] max-h-[460px] object-cover cursor-pointer transition duration-700 hover:scale-[1.01]"
        onClick={onQuote}
      />
    </section>
  )
}

function GiftsPageSkeleton() {
  return (
    <main className="bg-[#FAF7F2]" role="status" aria-label="Loading return gifts">
      <div className="h-[460px] animate-pulse bg-stone-200/70" />
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-4 py-16 min-[480px]:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <GiftProductCardSkeleton key={index} />
        ))}
      </div>
    </main>
  )
}
