import { CheckCircle2, Loader2, LogIn, MessageSquareHeart, Star } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { useCreateReviewMutation } from '../../features/catalog/catalogApi'
import { useAuth } from '../../hooks/useAuth'
import { errorMessage, isApiError } from '../../lib/http/apiClient'
import type { Review } from '../../types/api'
import { loginHref } from '../../utils/router'

const TITLE = { min: 3, max: 120 }
const CONTENT = { min: 10, max: 2000 }
const RATING_WORDS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent']

type Errors = Partial<Record<'rating' | 'title' | 'content', string>>

const validate = (rating: number, title: string, content: string): Errors => {
  const errors: Errors = {}
  if (rating < 1) errors.rating = 'Choose a star rating.'
  if (title.trim().length < TITLE.min) errors.title = `Add a title of at least ${TITLE.min} characters.`
  if (content.trim().length < CONTENT.min) errors.content = `Tell us a little more — at least ${CONTENT.min} characters.`
  return errors
}

type ReviewFormProps = {
  slug: string
  productName: string
  /** Focus the form on mount (deep link `?review=1`). */
  autoFocus?: boolean
  onSubmitted: (review: Review) => void
}

export function ReviewForm({ slug, productName, autoFocus = false, onSubmitted }: ReviewFormProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const [createReview, { isLoading: submitting }] = useCreateReviewMutation()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [state, setState] = useState<'form' | 'done' | 'duplicate'>('form')
  const rootRef = useRef<HTMLDivElement>(null)
  const firstStarRef = useRef<HTMLInputElement>(null)
  const id = useId()

  useEffect(() => {
    if (!autoFocus || isLoading) return
    const timer = window.setTimeout(() => {
      rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      firstStarRef.current?.focus({ preventScroll: true })
    }, 350)
    return () => window.clearTimeout(timer)
  }, [autoFocus, isLoading])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const found = validate(rating, title, content)
    setErrors(found)
    setServerError(null)
    if (Object.keys(found).length) return
    try {
      const review = await createReview({ slug, rating, title: title.trim(), content: content.trim() }).unwrap()
      setState('done')
      toast.success('Thank you for your review!', { description: `Your thoughts on ${productName} are now live.` })
      onSubmitted(review)
    } catch (error) {
      if (isApiError(error) && error.status === 409) {
        setState('duplicate')
        return
      }
      const message = errorMessage(error)
      setServerError(message)
      toast.error('Could not submit your review', { description: message })
    }
  }

  if (isLoading) return <div className="review-form" ref={rootRef} />

  if (!isAuthenticated) {
    return (
      <div className="review-form review-cta" ref={rootRef}>
        <MessageSquareHeart size={26} aria-hidden="true" />
        <div>
          <h2>Tried {productName}?</h2>
          <p>Sign in to share your experience and help other customers choose.</p>
        </div>
        <a href={loginHref(`product/${slug}?review=1`)}><LogIn size={14} /> Sign in to write a review</a>
      </div>
    )
  }

  if (state !== 'form') {
    return (
      <div className="review-form review-cta" ref={rootRef} role="status">
        <CheckCircle2 size={26} aria-hidden="true" />
        <div>
          <h2>{state === 'done' ? 'Your review is live' : 'You’ve already reviewed this'}</h2>
          <p>{state === 'done' ? 'Thanks for helping fellow food lovers — it now appears in the list above.' : 'Each customer can review a product once. Thanks for sharing your thoughts earlier!'}</p>
        </div>
      </div>
    )
  }

  const shown = hover || rating
  const describedBy = (field: keyof Errors, extra?: string) => [errors[field] ? `${id}-${field}-error` : '', extra ?? ''].filter(Boolean).join(' ') || undefined

  return (
    <div className="review-form" ref={rootRef}>
      <form onSubmit={submit} noValidate aria-labelledby={`${id}-heading`}>
        <h2 id={`${id}-heading`}>Write a Review</h2>
        <fieldset className="mt-4" aria-describedby={describedBy('rating')}>
          <legend className="review-label">How would you rate it?</legend>
          <div className="review-star-picker" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((value) => (
              <label key={value} onMouseEnter={() => setHover(value)}>
                <input
                  ref={value === 1 ? firstStarRef : undefined}
                  className="sr-only"
                  type="radio"
                  name={`${id}-rating`}
                  value={value}
                  checked={rating === value}
                  onChange={() => { setRating(value); setErrors((current) => ({ ...current, rating: undefined })) }}
                />
                <Star size={24} fill={value <= shown ? 'currentColor' : 'none'} strokeWidth={1.6} aria-hidden="true" />
                <span className="sr-only">{value} star{value === 1 ? '' : 's'} — {RATING_WORDS[value]}</span>
              </label>
            ))}
            <span className="review-star-word" aria-hidden="true">{RATING_WORDS[shown] || 'Tap a star'}</span>
          </div>
          {errors.rating && <p className="review-error" id={`${id}-rating-error`} role="alert">{errors.rating}</p>}
        </fieldset>

        <div className="review-field">
          <label className="review-label" htmlFor={`${id}-title`}>Review title</label>
          <input
            id={`${id}-title`}
            value={title}
            maxLength={TITLE.max}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => title && setErrors((current) => ({ ...current, title: validate(1, title, 'x'.repeat(CONTENT.min)).title }))}
            placeholder="Sum it up in a few words"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={describedBy('title', `${id}-title-count`)}
          />
          <div className="review-meta">{errors.title ? <p className="review-error" id={`${id}-title-error`} role="alert">{errors.title}</p> : <span />}<small id={`${id}-title-count`}>{title.length}/{TITLE.max}</small></div>
        </div>

        <div className="review-field">
          <label className="review-label" htmlFor={`${id}-content`}>Your review</label>
          <textarea
            id={`${id}-content`}
            value={content}
            maxLength={CONTENT.max}
            rows={6}
            onChange={(event) => setContent(event.target.value)}
            onBlur={() => content && setErrors((current) => ({ ...current, content: validate(1, 'xxx', content).content }))}
            placeholder={`What did you enjoy about ${productName}? How did you use it?`}
            aria-invalid={Boolean(errors.content)}
            aria-describedby={describedBy('content', `${id}-content-count`)}
          />
          <div className="review-meta">{errors.content ? <p className="review-error" id={`${id}-content-error`} role="alert">{errors.content}</p> : <span />}<small id={`${id}-content-count`}>{content.length}/{CONTENT.max}</small></div>
        </div>

        {serverError && <p className="review-error mt-3" role="alert">{serverError}</p>}
        <button className="submit-review" type="submit" disabled={submitting} aria-busy={submitting}>
          {submitting ? <><Loader2 className="animate-spin" size={14} /> Submitting…</> : 'Submit review'}
        </button>
      </form>
    </div>
  )
}
