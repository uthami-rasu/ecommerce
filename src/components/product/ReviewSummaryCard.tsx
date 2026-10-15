import { Star } from 'lucide-react'
import type { ReviewSummary } from '../../types/api'
import { formatRating } from '../catalog/catalogFormat'
import { Stars } from '../catalog/RatingStars'

export function ReviewSummaryCard({ summary }: { summary: ReviewSummary }) {
  const total = summary.count
  return (
    <div className="review-summary">
      <div className="review-score">
        <strong>{total ? formatRating(summary.average) : '–'}</strong>
        <span><Stars rating={total ? summary.average : 0} size={15} /></span>
        <small>{total ? `${total} review${total === 1 ? '' : 's'}` : 'No reviews yet'}</small>
      </div>
      <div className="rating-bars" role="list" aria-label="Rating distribution">
        {([5, 4, 3, 2, 1] as const).map((stars) => {
          const count = summary.distribution[String(stars) as keyof ReviewSummary['distribution']] ?? 0
          const percent = total ? Math.round((count / total) * 100) : 0
          return (
            <div key={stars} role="listitem" aria-label={`${stars} star${stars === 1 ? '' : 's'}: ${count} review${count === 1 ? '' : 's'} (${percent}%)`}>
              <span className="bar-track" aria-hidden="true"><i style={{ width: `${percent}%` }} /></span>
              <span className="bar-stars" aria-hidden="true">{Array.from({ length: stars }, (_, star) => <Star key={star} size={10} fill="currentColor" />)}</span>
              <b aria-hidden="true">{percent}%</b>
            </div>
          )
        })}
      </div>
    </div>
  )
}
