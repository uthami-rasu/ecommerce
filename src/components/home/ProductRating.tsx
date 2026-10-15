import { Star } from 'lucide-react'
import { formatRating } from '../catalog/catalogFormat'

type ProductRatingProps = {
  rating: number
  reviews: number
}

/** One star and the score, rather than five identical stars on every card. */
export function ProductRating({ rating, reviews }: ProductRatingProps) {
  if (!reviews) {
    return <span className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#b0884f]">New</span>
  }
  return (
    <span className="flex items-center gap-1.5" role="img" aria-label={`${formatRating(rating)} out of 5 stars, ${reviews} review${reviews === 1 ? '' : 's'}`}>
      <Star aria-hidden="true" className="fill-[#dda23f] text-[#dda23f]" size={12} strokeWidth={1.5} />
      <span className="text-[11px] font-bold leading-none text-[#173f32] dark:text-stone-200">{formatRating(rating)}</span>
      <span className="text-[10px] leading-none text-stone-400">({reviews})</span>
    </span>
  )
}
