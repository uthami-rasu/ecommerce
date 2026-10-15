import { BadgeCheck } from 'lucide-react'
import type { Review } from '../../types/api'
import { formatDate, formatRelative } from '../../utils/format'
import { Stars } from '../catalog/RatingStars'

export function ReviewItem({ review, highlight = false }: { review: Review; highlight?: boolean }) {
  return (
    <article className={`customer-review ${highlight ? 'is-new' : ''}`}>
      <span className="review-avatar" aria-hidden="true">{review.author.initials}</span>
      <div className="min-w-0">
        <header className="flex-wrap">
          <b>{review.author.name}</b>
          <small><time dateTime={review.createdAt} title={formatDate(review.createdAt)}>{formatRelative(review.createdAt)}</time></small>
          {review.isVerifiedPurchase && <span className="review-verified"><BadgeCheck size={12} /> Verified purchase</span>}
        </header>
        <span className="review-stars" role="img" aria-label={`Rated ${review.rating} out of 5`}><Stars rating={review.rating} size={11} /></span>
        <h3>{review.title}</h3>
        <p className="whitespace-pre-line break-words">{review.content}</p>
      </div>
    </article>
  )
}
