import { useEffect, useRef, useState } from 'react'

type ScrollProgressProps = {
  route?: string
}

export function ScrollProgress({ route }: ScrollProgressProps) {
  const scrollBarRef = useRef<HTMLDivElement>(null)
  const navLoaderRef = useRef<HTMLDivElement>(null)
  const [depthPct, setDepthPct] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const scrollTimeoutRef = useRef<number | null>(null)

  // 1. YouTube-style Navigation Loading Bar on route change
  useEffect(() => {
    if (!route) return
    setIsNavigating(true)

    if (navLoaderRef.current) {
      navLoaderRef.current.style.opacity = '1'
      navLoaderRef.current.style.width = '0%'
      navLoaderRef.current.style.transition = 'width 200ms cubic-bezier(0.4, 0, 0.2, 1)'

      requestAnimationFrame(() => {
        if (navLoaderRef.current) navLoaderRef.current.style.width = '70%'
      })

      const timer1 = setTimeout(() => {
        if (navLoaderRef.current) navLoaderRef.current.style.width = '100%'
      }, 220)

      const timer2 = setTimeout(() => {
        if (navLoaderRef.current) navLoaderRef.current.style.opacity = '0'
        setIsNavigating(false)
      }, 450)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [route])

  // 2. Scroll depth measurement (Lenis + Native fallback)
  useEffect(() => {
    const updateScrollDepth = (val: number) => {
      const clamped = Math.max(0, Math.min(1, val))
      const pct = Math.round(clamped * 100)
      setDepthPct(pct)

      if (scrollBarRef.current) {
        scrollBarRef.current.style.transform = `scaleX(${clamped})`
      }

      setIsScrolling(true)
      if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsScrolling(false)
      }, 1500)
    }

    const calcNativeDepth = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0
      updateScrollDepth(progress)
    }

    let lenisAdded = false
    const attachLenis = () => {
      const lenis = (window as any).lenis
      if (lenis && typeof lenis.on === 'function') {
        lenis.on('scroll', (e: { progress: number }) => {
          updateScrollDepth(e.progress)
        })
        lenisAdded = true
      }
    }

    attachLenis()
    const timer = setTimeout(attachLenis, 300)

    const onNativeScroll = () => {
      if (!lenisAdded) {
        calcNativeDepth()
      }
    }

    calcNativeDepth()
    window.addEventListener('scroll', onNativeScroll, { passive: true })
    window.addEventListener('resize', calcNativeDepth)

    return () => {
      clearTimeout(timer)
      if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current)
      window.removeEventListener('scroll', onNativeScroll)
      window.removeEventListener('resize', calcNativeDepth)
    }
  }, [])

  return (
    <>
      {/* YouTube Navigation Progress Bar */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[100000] h-[3px] bg-transparent"
      >
        <div
          ref={navLoaderRef}
          className="h-full w-0 bg-gradient-to-r from-[#f59e0b] via-[#eab308] to-[#dc2626] shadow-[0_0_14px_#f59e0b,0_0_8px_#ef4444] transition-all duration-300 ease-out opacity-0"
        />
      </div>

      {/* Depth Level Scroll Progress Bar */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[99999] h-[3.5px] bg-stone-900/10 dark:bg-stone-100/10"
        aria-label={`Scroll depth progress: ${depthPct}%`}
      >
        <div
          ref={scrollBarRef}
          className="relative h-full origin-left scale-x-0 bg-gradient-to-r from-amber-600 via-amber-400 to-[#f59e0b] shadow-[0_0_12px_#f59e0b,0_0_6px_#f59e0b] transition-transform duration-75 ease-out will-change-transform"
        >
          {/* Glowing cap tip indicator */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 size-2.5 rounded-full bg-[#fde047] shadow-[0_0_10px_#f59e0b]" />
        </div>
      </div>

      {/* Floating Depth Level Pill Badge */}
      <div
        className={`pointer-events-none fixed right-5 top-20 z-[9999] flex items-center gap-2 rounded-full border border-amber-200/60 dark:border-amber-800/40 bg-white/90 dark:bg-stone-900/90 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 shadow-xl backdrop-blur-md transition-all duration-500 ${
          isScrolling || isNavigating ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-3 opacity-0 scale-95'
        }`}
      >
        <span className="size-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-ping" />
        <span>Depth: <strong className="font-mono text-amber-600 dark:text-amber-400">{depthPct}%</strong></span>
      </div>
    </>
  )
}
