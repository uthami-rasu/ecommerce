import { useEffect, useRef } from 'react'

export function ScrollProgress() {
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`
      frame = 0
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress)
    }
    updateProgress()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] bg-transparent" aria-hidden="true">
      <div ref={progressRef} className="h-full origin-left scale-x-0 bg-gradient-to-r from-[#d6a555] via-[#f0cf8a] to-[#4f8069] shadow-[0_0_12px_rgba(214,165,85,.65)] will-change-transform" />
    </div>
  )
}
