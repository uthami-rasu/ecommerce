import { ImageOff } from 'lucide-react'

/** Square product image with a graceful placeholder when the product has no photo. */
export function ProductThumb({ src, alt, className = 'size-20' }: { src: string | null; alt: string; className?: string }) {
  return src ? (
    <img src={src} alt={alt} loading="lazy" className={`${className} flex-none rounded-2xl bg-stone-100 object-cover dark:bg-stone-800`} />
  ) : (
    <span className={`${className} grid flex-none place-items-center rounded-2xl bg-stone-100 text-stone-400 dark:bg-stone-800`} aria-label={alt} role="img">
      <ImageOff size={18} />
    </span>
  )
}
