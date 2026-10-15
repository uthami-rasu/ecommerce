import { Leaf } from 'lucide-react'
import type { ImageView } from '../../types/api'
import '../../styles/catalog.css'

type ProductImageProps = {
  image: ImageView | null | undefined
  alt: string
  /** `sizes` hint for the browser, e.g. "(min-width: 1024px) 25vw, 50vw". */
  sizes?: string
  className?: string
  /** Above-the-fold images load eagerly with high priority. */
  priority?: boolean
}

/** Renditions produced by the API: sm 200w, md 600w, lg ≤1200w. */
const srcSetOf = (image: ImageView) => {
  const entries = [`${image.thumbUrl} 200w`, `${image.mediumUrl} 600w`]
  if (image.url !== image.mediumUrl) entries.push(`${image.url} 1200w`)
  return entries.join(', ')
}

/**
 * Responsive product photo. The parent provides the aspect-ratio box; intrinsic
 * width/height keep the ratio stable before the file arrives (no layout shift).
 */
export function ProductImage({ image, alt, sizes = '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw', className = '', priority = false }: ProductImageProps) {
  if (!image) {
    return (
      <span className={`catalog-image-placeholder ${className}`} role="img" aria-label={alt}>
        <Leaf size={28} strokeWidth={1.4} aria-hidden="true" />
      </span>
    )
  }
  return (
    <img
      className={className}
      src={image.mediumUrl}
      srcSet={srcSetOf(image)}
      sizes={sizes}
      alt={image.alt || alt}
      width={600}
      height={600}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
    />
  )
}
