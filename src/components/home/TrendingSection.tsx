import { ArrowUpRight, Check, Plus, Sparkles, Star } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { trendingProducts } from '../../constants/trendingProducts'
import pistachioPhoto from '../../assets/images/unsplash-pistachio.jpg'
import mixedNutsPhoto from '../../assets/images/unsplash-cashew.jpg'
import almondPhoto from '../../assets/images/unsplash-almond.jpg'

const featuredTrendingProducts = trendingProducts.slice(0, 5)
const tickerSource = [
  { ...featuredTrendingProducts[0], name: 'Single Pistachios', image: pistachioPhoto },
  { ...featuredTrendingProducts[1], name: 'Roasted Nut Medley', image: mixedNutsPhoto },
  { ...featuredTrendingProducts[2], name: 'Sunlit Almonds', image: almondPhoto },
  ...featuredTrendingProducts.slice(3),
]
const tickerProducts = [...tickerSource, ...tickerSource]

export function TrendingSection() {
  const [activeId, setActiveId] = useState(featuredTrendingProducts[1].id)
  const [isAdded, setIsAdded] = useState(false)
  const tickerRef = useRef<HTMLDivElement>(null)
  const activeProduct = featuredTrendingProducts.find((product) => product.id === activeId) ?? featuredTrendingProducts[0]

  useEffect(() => {
    const ticker = tickerRef.current
    if (!ticker || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0

    const updateDepth = () => {
      const viewportCenter = window.innerWidth / 2
      const depthRange = Math.max(window.innerWidth * 0.52, 420)
      ticker.querySelectorAll<HTMLElement>('.ticker-product').forEach((card) => {
        const rect = card.getBoundingClientRect()
        const cardCenter = rect.left + rect.width / 2
        const signedDistance = (cardCenter - viewportCenter) / depthRange
        const distance = Math.min(Math.abs(signedDistance), 1)
        card.style.setProperty('--marquee-scale', `${1 - distance * 0.15}`)
        card.style.setProperty('--marquee-opacity', `${1 - distance * 0.46}`)
        card.style.setProperty('--marquee-rotate', `${signedDistance * -9}deg`)
      })
      frame = window.requestAnimationFrame(updateDepth)
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !frame) frame = window.requestAnimationFrame(updateDepth)
      if (!entry.isIntersecting && frame) {
        window.cancelAnimationFrame(frame)
        frame = 0
      }
    })
    observer.observe(ticker)
    return () => {
      observer.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveId((currentId) => {
        const currentIndex = featuredTrendingProducts.findIndex((product) => product.id === currentId)
        return featuredTrendingProducts[(currentIndex + 1) % featuredTrendingProducts.length].id
      })
    }, 5000)
    return () => window.clearInterval(timer)
  }, [])

  const addFeatured = () => {
    setIsAdded(true)
    window.setTimeout(() => setIsAdded(false), 1600)
  }

  return (
    <section className="overflow-hidden bg-[#f8f5ee] pb-28 dark:bg-stone-950" id="trending">
      <div className="product-ticker" aria-label="Popular product scroller" ref={tickerRef}>
        <div className="scroller-glow scroller-glow-one" aria-hidden="true" />
        <div className="scroller-glow scroller-glow-two" aria-hidden="true" />
        <div className="product-ticker-track relative flex w-max items-center gap-5 pr-5" aria-label="Popular products">
          {tickerProducts.map((product, index) => (
            <button className="ticker-product group" key={`${product.id}-${index}`} type="button" onClick={() => setActiveId(product.id)}>
              <span className="ticker-card-surface flex items-center gap-4">
                <span className="ticker-image size-16 shrink-0 overflow-hidden"><img className="size-full object-cover transition duration-500 group-hover:scale-110 group-hover:rotate-3" src={product.image} alt="" /></span>
                <span className="min-w-[128px] text-left"><small className="mb-1 block text-[8px] font-bold uppercase tracking-[.17em] opacity-50">Popular • 0{index % tickerSource.length + 1}</small><strong className="block text-[13px] font-bold leading-tight">{product.name}</strong><span className="mt-1.5 block text-[11px] font-bold opacity-70">₹{product.price}</span></span>
                <span className="ticker-arrow grid size-7 shrink-0 place-items-center rounded-full border border-current/20 text-sm transition duration-300 group-hover:rotate-45 group-hover:scale-110">↗</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1180px] px-5 pt-24 sm:px-8">
        <header className="mb-11 flex flex-col gap-5 md:flex-row md:items-end md:justify-between" data-reveal>
          <div>
            <p className="eyebrow">The weekly edit</p>
            <h2 className="mt-3 font-display text-[clamp(2.8rem,5vw,4.7rem)] font-bold leading-[.9] tracking-[-.045em] text-[#173f32] dark:text-white">Trending now,<br /><span className="italic text-[#b77838]">loved always.</span></h2>
          </div>
          <p className="max-w-[355px] text-sm leading-7 text-stone-500">The flavours customers can&apos;t stop reaching for—curated fresh every week.</p>
        </header>

        <div className="trending-editorial grid overflow-hidden rounded-[36px] border border-[#ded5c6] bg-white shadow-[0_30px_70px_rgba(44,37,27,.1)] dark:border-stone-800 dark:bg-stone-900 lg:grid-cols-[1.35fr_.65fr]" data-reveal>
          <article className="trending-spotlight relative isolate flex min-h-[540px] flex-col overflow-hidden bg-[#173f32] p-7 text-white sm:p-10 lg:min-h-[610px]">
            <div className="absolute -right-24 -top-24 -z-10 size-[430px] rounded-full border border-white/10" />
            <div className="absolute -bottom-32 -left-16 -z-10 size-[340px] rounded-full bg-[#d39a4b]/15 blur-2xl" />
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-[9px] font-bold uppercase tracking-[.16em] text-[#efd6a4]"><Sparkles size={12} /> Editor&apos;s pick</span>
              <span className="flex items-center gap-1 text-xs text-[#f1d38f]"><Star size={13} fill="currentColor" /> 4.9</span>
            </div>

            <div className="relative flex flex-1 items-center justify-center py-8">
              <span className="absolute size-[280px] rounded-full bg-[#f2dfb8] sm:size-[370px]" />
              <img className="spotlight-image relative z-10 h-[300px] w-[90%] object-contain drop-shadow-[0_30px_35px_rgba(0,0,0,.28)] sm:h-[390px]" src={activeProduct.image} alt={activeProduct.name} key={activeProduct.id} />
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="spotlight-copy" key={`copy-${activeProduct.id}`}><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#d5b77f]">This week&apos;s favourite</p><h3 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{activeProduct.name}</h3><p className="mt-2 text-xl font-bold text-[#efcd86]">₹{activeProduct.price}</p></div>
              <button className={`inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold transition hover:-translate-y-1 ${isAdded ? 'bg-[#668c77] text-white' : 'bg-white text-[#173f32] hover:bg-[#f0d59f]'}`} type="button" onClick={addFeatured}>{isAdded ? <Check size={17} /> : <Plus size={17} />}{isAdded ? 'Added to bag' : 'Add to bag'}</button>
            </div>
          </article>

          <aside className="flex flex-col p-4 sm:p-6">
            <div className="mb-3 flex items-center justify-between px-2 py-2"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-stone-400">Choose your favourite</p><ArrowUpRight className="text-[#ad7135]" size={18} /></div>
            <div className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {featuredTrendingProducts.map((product, index) => {
                const isActive = product.id === activeProduct.id
                return (
                  <button className={`trending-choice group flex items-center gap-4 rounded-[20px] border p-3 text-left transition duration-300 ${isActive ? 'border-[#caa56b] bg-[#f6efe3]' : 'border-transparent hover:border-[#e6ddd0] hover:bg-[#faf7f1]'}`} key={product.id} type="button" onClick={() => setActiveId(product.id)}>
                    <span className="grid size-[72px] shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#eee5d7]"><img className="size-full object-contain transition duration-500 group-hover:scale-110" src={product.image} alt="" /></span>
                    <span className="min-w-0 flex-1"><small className="text-[9px] font-bold uppercase tracking-[.13em] text-stone-400">0{index + 1}</small><strong className="mt-1 block truncate text-sm text-[#173f32] dark:text-white">{product.name}</strong><span className="mt-1 block text-xs font-bold text-[#b57437]">₹{product.price}</span></span>
                    <span className={`size-2 rounded-full transition ${isActive ? 'scale-100 bg-[#b87939]' : 'scale-0 bg-transparent'}`} />
                  </button>
                )
              })}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
