import { AlertCircle, Loader2, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useGetReviewsQuery } from '../../features/catalog/catalogApi'
import { errorMessage } from '../../lib/http/apiClient'
import type { Review } from '../../types/api'
import { SkeletonLine } from '../catalog/Skeletons'
import { ReviewForm } from './ReviewForm'
import { ReviewItem } from './ReviewItem'
import { ReviewSummaryCard } from './ReviewSummaryCard'

const PAGE_SIZE = 5

function ReviewsSkeleton() {
  return (
    <div className="mt-6 space-y-6" aria-hidden="true">
      {Array.from({ length: 2 }, (_, index) => (
        <div className="flex gap-4" key={index}><span className="catalog-skeleton size-10 shrink-0 rounded-full" /><span className="flex-1 space-y-2.5"><SkeletonLine className="h-3 w-40" /><SkeletonLine className="h-2.5 w-20" /><SkeletonLine className="h-3 w-3/4" /><SkeletonLine className="h-3 w-2/3" /></span></div>
      ))}
    </div>
  )
}

/** Pages 2..n of the review list. */
function MoreReviews({ slug, page, newId }: { slug: string; page: number; newId?: string }) {
  const { data, isFetching } = useGetReviewsQuery({ slug, page, limit: PAGE_SIZE })
  if (!data || isFetching) return <ReviewsSkeleton />
  return <>{data.data.map((review) => <ReviewItem key={review.id} review={review} highlight={review.id === newId} />)}</>
}

type ReviewsPanelProps = { slug: string; productName: string; focusForm: boolean }

export function ReviewsPanel({ slug, productName, focusForm }: ReviewsPanelProps) {
  const [pages, setPages] = useState(1)
  const [newReview, setNewReview] = useState<Review | null>(null)
  const first = useGetReviewsQuery({ slug, page: 1, limit: PAGE_SIZE })
  const last = useGetReviewsQuery({ slug, page: pages, limit: PAGE_SIZE }, { skip: pages === 1 })
  const data = first.data
  const totalPages = data?.meta.totalPages ?? 1

  const onSubmitted = (review: Review) => {
    setNewReview(review)
    setPages(1)
  }

  return (
    <div className="reviews-panel" id="reviews">
      <h2>Customer Feedback</h2>
      {data ? <ReviewSummaryCard summary={data.summary} /> : first.isError ? null : <div className="review-summary" aria-hidden="true"><span className="catalog-skeleton block min-h-[150px] rounded-xl" /><span className="catalog-skeleton block min-h-[150px] rounded-xl" /></div>}

      <h2 className="review-list-heading">Reviews</h2>
      {first.isError && !data ? (
        <div className="review-empty" role="alert">
          <AlertCircle size={20} />
          <p>{errorMessage(first.error)}</p>
          <button type="button" onClick={() => first.refetch()}><RotateCcw size={12} /> Try again</button>
        </div>
      ) : !data ? (
        <ReviewsSkeleton />
      ) : data.data.length === 0 && !newReview ? (
        <div className="review-empty"><p>No reviews yet — be the first to share what you think.</p></div>
      ) : (
        <div className="customer-reviews" aria-busy={first.isFetching}>
          {/* Show the just-posted review straight away, even before the list refetch lands. */}
          {newReview && !data.data.some((review) => review.id === newReview.id) && <ReviewItem review={newReview} highlight />}
          {data.data.map((review) => <ReviewItem key={review.id} review={review} highlight={review.id === newReview?.id} />)}
          {Array.from({ length: pages - 1 }, (_, index) => <MoreReviews key={index + 2} slug={slug} page={index + 2} newId={newReview?.id} />)}
        </div>
      )}
      {data && pages < totalPages && (
        <button className="view-reviews" type="button" onClick={() => setPages((value) => value + 1)} disabled={last.isFetching}>
          {last.isFetching ? <><Loader2 className="mr-1 inline animate-spin" size={12} /> Loading…</> : `Load more reviews (${data.meta.total - pages * PAGE_SIZE} more)`}
        </button>
      )}

      <ReviewForm slug={slug} productName={productName} autoFocus={focusForm} onSubmitted={onSubmitted} />
    </div>
  )
}
