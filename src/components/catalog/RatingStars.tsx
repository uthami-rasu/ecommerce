import { Star } from 'lucide-react'
import { formatRating } from './catalogFormat'

type RatingStarsProps = {
  rating: number
  count?: number
  size?: number
  /** Show the numeric score next to the stars. */
  showValue?: boolean
  className?: string
}

/** Five stars with fractional fill, e.g. 4.67 fills two thirds of the fifth star. */
export function Stars({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <span className="relative inline-flex shrink-0" aria-hidden="true">
      <span className="flex text-[#e2d6c2] dark:text-stone-700">
        {Array.from({ length: 5 }, (_, index) => <Star key={index} size={size} fill="currentColor" strokeWidth={1.5} />)}
      </span>
      <span className="absolute inset-0 flex overflow-hidden text-[#d6941a]" style={{ width: `${Math.max(0, Math.min(5, rating)) * 20}%` }}>
        {Array.from({ length: 5 }, (_, index) => <Star key={index} className="shrink-0" size={size} fill="currentColor" strokeWidth={1.5} />)}
      </span>
    </span>
  )
}

export function RatingStars({ rating, count, size = 12, showValue = true, className = '' }: RatingStarsProps) {
  const label = count === 0 ? 'No reviews yet' : `${formatRating(rating)} out of 5 stars${count !== undefined ? `, ${count} review${count === 1 ? '' : 's'}` : ''}`
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} role="img" aria-label={label}>
      <Stars rating={count === 0 ? 0 : rating} size={size} />
      {count === 0 ? (
        <span className="text-[10px] text-stone-400">New</span>
      ) : (
        <>
          {showValue && <span className="text-[11px] font-semibold text-stone-700 dark:text-stone-200">{formatRating(rating)}</span>}
          {count !== undefined && <span className="text-[10px] text-stone-400">({count})</span>}
        </>
      )}
    </span>
  )
}
