import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'
import type { ImageView } from '../../types/api'
import { ProductImage } from '../catalog/ProductImage'

type ProductGalleryProps = {
  images: ImageView[]
  name: string
  wished: boolean
  onWish: () => void
}

export function ProductGallery({ images, name, wished, onWish }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0)
  const count = images.length
  const current = images[Math.min(selected, Math.max(0, count - 1))] ?? null
  const go = (step: number) => count > 1 && setSelected((index) => (index + step + count) % count)

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') go(-1)
    if (event.key === 'ArrowRight') go(1)
  }

  return (
    <div className="product-gallery" role="region" aria-roledescription="carousel" aria-label={`${name} photos`} onKeyDown={onKeyDown}>
      <div className="product-main-image">
        <ProductImage key={current?.id ?? 'placeholder'} className="pdp-main-photo" image={current} alt={current?.alt || name} sizes="(min-width: 900px) 520px, 100vw" priority />
        <button className={wished ? 'is-active' : ''} type="button" onClick={onWish} aria-pressed={wished} aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}><Heart size={18} fill={wished ? 'currentColor' : 'none'} /></button>
        {count > 1 && <span className="pdp-photo-count" aria-live="polite">{Math.min(selected, count - 1) + 1} / {count}</span>}
      </div>
      {count > 1 && (
        <div className="product-thumbnails">
          <button type="button" aria-label="Previous photo" onClick={() => go(-1)}><ChevronLeft size={16} /></button>
          <div className="pdp-thumb-track" role="group" aria-label="Choose a photo">
            {images.map((image, index) => (
              <button className={selected === index ? 'is-active' : ''} type="button" key={image.id} onClick={() => setSelected(index)} aria-label={`Show photo ${index + 1} of ${count}`} aria-current={selected === index}>
                <img src={image.thumbUrl} alt="" width={200} height={200} loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
          <button type="button" aria-label="Next photo" onClick={() => go(1)}><ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  )
}
