import { Star } from 'lucide-react'

type ProductRatingProps = {
  reviews: number
}

export function ProductRating({ reviews }: ProductRatingProps) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`5 out of 5 stars, ${reviews} reviews`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          aria-hidden="true"
          className="fill-amber-400 text-amber-400"
          key={index}
          size={13}
          strokeWidth={1.5}
        />
      ))}
      <span className="ml-1 text-[10px] text-stone-400">({reviews})</span>
    </div>
  )
}
